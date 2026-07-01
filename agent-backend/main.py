"""
Autogent Lead Agent — FastAPI backend.
Запуск: uvicorn main:app --host 0.0.0.0 --port 8000
"""
import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import anthropic
from dotenv import load_dotenv

from security import sanitize, turns_exceeded, InputError
from funnel import (
    SYSTEM_PROMPT,
    detect_show_budget,
    detect_done,
    extract_contact,
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
)
log = logging.getLogger(__name__)

# ── Sessions (in-memory; для продакшна замените на Redis) ─────────────────────
sessions: dict[str, dict] = {}   # {session_id: {history: [...], created_at: float}}
SESSION_TTL = 3600  # 1 час


def get_session(session_id: str) -> dict:
    now = time.time()
    session = sessions.get(session_id)
    if session is None:
        sessions[session_id] = {"history": [], "created_at": now, "done": False}
        return sessions[session_id]
    # Expire old sessions
    if now - session["created_at"] > SESSION_TTL:
        sessions[session_id] = {"history": [], "created_at": now, "done": False}
    return sessions[session_id]


def cleanup_old_sessions() -> None:
    now = time.time()
    expired = [k for k, v in sessions.items() if now - v["created_at"] > SESSION_TTL]
    for k in expired:
        del sessions[k]
    if expired:
        log.info("Cleaned up %d expired sessions", len(expired))


# ── FastAPI setup ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Autogent Lead Agent starting up")
    yield
    log.info("Autogent Lead Agent shutting down")


app = FastAPI(title="Autogent Lead Agent", lifespan=lifespan, docs_url=None, redoc_url=None)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# CORS — разрешаем только домен продакшн сайта (и localhost для dev)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://autogentgroup.ru,https://www.autogentgroup.ru,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# Anthropic client
_anthropic = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")  # быстро и дёшево


# ── Request / Response schemas ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        if len(v) > 64 or not v.replace("-", "").isalnum():
            raise ValueError("Invalid session_id")
        return v


class ChatResponse(BaseModel):
    reply: str
    show_budget: bool = False
    done: bool = False
    contact: str = ""


# ── Rate limit error handler ───────────────────────────────────────────────────
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Слишком много запросов. Подождите минуту."},
    )


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    cleanup_old_sessions()
    return {"status": "ok", "sessions": len(sessions)}


# ── Chat endpoint ──────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    session = get_session(body.session_id)

    # Если диалог уже завершён — не обрабатываем
    if session.get("done"):
        return ChatResponse(reply="Мы уже получили ваш контакт! Команда скоро свяжется.", done=True)

    if turns_exceeded(session["history"]):
        return ChatResponse(
            reply="Кажется, мы обсудили всё необходимое. Команда Autogent свяжется с вами в течение рабочего дня.",
            done=True,
        )

    # Валидация и санитизация
    try:
        safe_message = sanitize(body.message)
    except InputError as e:
        if "INJECTION_DETECTED" in str(e):
            log.warning("Prompt injection attempt in session %s", body.session_id)
            return ChatResponse(
                reply="Я помогаю только с вопросами об автоматизации бизнеса. Давайте продолжим."
            )
        raise HTTPException(status_code=422, detail=str(e))

    # Добавляем сообщение пользователя в историю
    session["history"].append({"role": "user", "content": safe_message})

    # Вызов Claude
    try:
        response = _anthropic.messages.create(
            model=MODEL,
            max_tokens=512,
            system=SYSTEM_PROMPT,
            messages=session["history"],
        )
    except anthropic.APIError as e:
        log.error("Anthropic API error: %s", e)
        raise HTTPException(status_code=502, detail="Ошибка AI-сервиса. Попробуйте ещё раз.")

    reply_text = response.content[0].text.strip()

    # Сохраняем ответ агента в историю
    session["history"].append({"role": "assistant", "content": reply_text})

    show_budget = detect_show_budget(reply_text)
    done        = detect_done(reply_text)
    contact     = ""

    if done:
        session["done"] = True
        # Пытаемся достать контакт из предыдущего сообщения пользователя
        contact = extract_contact(safe_message)
        log.info("Session %s qualified. Contact: %s", body.session_id[:8], contact or "—")

    log.info("Session %s | turn %d | tokens_used %d",
             body.session_id[:8], len(session["history"]) // 2,
             response.usage.input_tokens + response.usage.output_tokens)

    return ChatResponse(reply=reply_text, show_budget=show_budget, done=done, contact=contact)
