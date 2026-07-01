"""
AI Service — runs on 151.247.196.36
ВАЖНО: ПДн сюда НЕ поступают. Принимает только обезличенные сообщения от Gateway.
"""
import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from openai import OpenAI, APITimeoutError, APIError
from dotenv import load_dotenv

from funnel import (
    SYSTEM_PROMPT, detect_show_budget, detect_done,
    extract_contact_from_text, extract_answers_from_history,
)
from security import sanitize, turns_exceeded, budget_exceeded, InputError

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── REQUIRED: INTERNAL_KEY must be set ────────────────────────────────────────
INTERNAL_KEY = os.environ["INTERNAL_KEY"]   # KeyError = сервер не стартует без ключа
if len(INTERNAL_KEY) < 32:
    raise RuntimeError("INTERNAL_KEY must be at least 32 characters")

_openai = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    timeout=25.0,          # explicit timeout — не зависнет навсегда
    max_retries=1,
)
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# ── In-memory sessions ────────────────────────────────────────────────────────
sessions: dict[str, dict] = {}
SESSION_TTL = 3600


def get_session(sid: str) -> dict:
    now = time.time()
    s = sessions.get(sid)
    if s is None or now - s["created_at"] > SESSION_TTL:
        sessions[sid] = {
            "history":       [],
            "created_at":    now,
            "done":          False,
            "total_tokens":  0,
            "budget_shown":  False,   # показывали ли уже чипы бюджета
        }
    return sessions[sid]


def cleanup_sessions() -> None:
    now = time.time()
    expired = [k for k, v in sessions.items() if now - v["created_at"] > SESSION_TTL]
    for k in expired:
        del sessions[k]


# ── Rate limiter keyed by session_id (не по IP — весь трафик с одного IP) ──
def _session_key(request: Request) -> str:
    try:
        # FastAPI не читает body в key_func — используем X-Session-Id header
        return request.headers.get("X-Session-Id", get_remote_address(request))
    except Exception:
        return "unknown"


def get_remote_address(request: Request) -> str:
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_session_key)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("AI Service starting | model=%s | NO PII", MODEL)
    yield
    log.info("AI Service shutting down")


app = FastAPI(title="Autogent AI Service", lifespan=lifespan, docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
# Нет CORS middleware — только gateway обращается к этому сервису напрямую


@app.exception_handler(RateLimitExceeded)
async def _rate(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Too many requests"})


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        clean = v.replace("-", "").replace("_", "")
        if not clean.isalnum() or len(v) > 64:
            raise ValueError("Invalid session_id")
        return v

    @field_validator("message")
    @classmethod
    def validate_msg(cls, v: str) -> str:
        if len(v.strip()) == 0:
            raise ValueError("Empty message")
        return v


# ── Main endpoint ─────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    cleanup_sessions()
    return {"status": "ok", "role": "ai-service", "pii": False, "sessions": len(sessions)}


@app.post("/chat")
@limiter.limit("12/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    x_internal_key: str | None = Header(default=None),
    x_session_id:   str | None = Header(default=None),
):
    # ── 1. Аутентификация от Gateway ─────────────────────────────────────────
    if x_internal_key != INTERNAL_KEY:
        log.warning("Unauthorized request from %s", request.client.host if request.client else "?")
        raise HTTPException(status_code=403, detail="Forbidden")

    session = get_session(body.session_id)

    # ── 2. Проверки лимитов ───────────────────────────────────────────────────
    if session["done"]:
        return {"reply": "Спасибо! Команда Autogent скоро свяжется с вами.", "done": True, "answers": None}

    if turns_exceeded(session["history"]):
        log.info("Session %s: max turns exceeded", body.session_id[:8])
        return {"reply": "Спасибо за диалог! Команда Autogent свяжется с вами в течение рабочего дня.", "done": True, "answers": None}

    if budget_exceeded(session["total_tokens"]):
        log.warning("Session %s: token budget exceeded (%d)", body.session_id[:8], session["total_tokens"])
        return {"reply": "Команда Autogent свяжется с вами в течение рабочего дня.", "done": True, "answers": None}

    # ── 3. Санитизация и защита от инъекций ──────────────────────────────────
    try:
        safe_msg = sanitize(body.message)
    except InputError as e:
        msg = str(e)
        if "INJECTION_DETECTED" in msg:
            log.warning("Injection attempt | session=%s | text=%r", body.session_id[:8], body.message[:80])
            return {"reply": "Я помогаю только с вопросами об автоматизации бизнеса. Давайте продолжим.", "done": False}
        raise HTTPException(status_code=422, detail=msg)

    session["history"].append({"role": "user", "content": safe_msg})

    # ── 4. Вызов OpenAI ───────────────────────────────────────────────────────
    try:
        response = _openai.chat.completions.create(
            model=MODEL,
            max_tokens=400,       # ограничиваем ответ агента
            temperature=0.65,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + session["history"],
        )
    except APITimeoutError:
        session["history"].pop()  # откатываем — не сохраняем неудачный turn
        log.error("OpenAI timeout | session=%s", body.session_id[:8])
        raise HTTPException(status_code=504, detail="AI timeout")
    except APIError as e:
        session["history"].pop()
        log.error("OpenAI API error: %s | session=%s", e, body.session_id[:8])
        raise HTTPException(status_code=502, detail="AI error")

    reply = response.choices[0].message.content.strip()
    session["history"].append({"role": "assistant", "content": reply})
    session["total_tokens"] += response.usage.total_tokens

    # ── 5. Определяем состояние сессии ───────────────────────────────────────
    show_budget = detect_show_budget(reply) and not session["budget_shown"]
    if show_budget:
        session["budget_shown"] = True

    done    = detect_done(reply)
    answers = None

    if done:
        session["done"] = True
        # Извлечь структурированные ответы и контакт
        contact = extract_contact_from_text(safe_msg)
        answers = extract_answers_from_history(session["history"], _openai, MODEL)
        if contact and not answers.get("contact"):
            answers["contact"] = contact
        log.info("Session %s DONE | contact=%s | tokens=%d",
                 body.session_id[:8], answers.get("contact", "—"), session["total_tokens"])

    log.info("Session %s | turn=%d | tokens_total=%d | done=%s",
             body.session_id[:8], len(session["history"]) // 2, session["total_tokens"], done)

    return {
        "reply":       reply,
        "show_budget": show_budget,
        "done":        done,
        "answers":     answers,   # dict с q1..q5 + contact, если done=True
    }
