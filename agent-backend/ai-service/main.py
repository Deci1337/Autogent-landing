"""
AI Service — runs on 151.247.196.36
- Принимает ТОЛЬКО обезличенные сообщения от Gateway
- Вызывает OpenAI gpt-4o-mini
- ПДн сюда НЕ поступают и НЕ хранятся
"""
import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from openai import OpenAI
from dotenv import load_dotenv

from funnel import SYSTEM_PROMPT, detect_show_budget, detect_done
from security import sanitize, turns_exceeded, InputError

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

INTERNAL_KEY = os.environ.get("INTERNAL_KEY", "")
_openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

sessions: dict[str, dict] = {}
SESSION_TTL = 3600


def get_session(session_id: str) -> dict:
    now = time.time()
    s = sessions.get(session_id)
    if s is None or now - s["created_at"] > SESSION_TTL:
        sessions[session_id] = {"history": [], "created_at": now, "done": False}
    return sessions[session_id]


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("AI Service starting (OpenAI gpt-4o-mini, NO PII)")
    yield


app = FastAPI(title="Autogent AI Service", lifespan=lifespan, docs_url=None, redoc_url=None)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def _rate(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Too many requests"})


class ChatRequest(BaseModel):
    session_id: str
    message: str

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        if len(v) > 64 or not v.replace("-", "").isalnum():
            raise ValueError("bad session_id")
        return v


@app.get("/health")
async def health():
    return {"status": "ok", "role": "ai-service", "pii": False}


@app.post("/chat")
@limiter.limit("30/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    x_internal_key: str | None = Header(default=None),
):
    # Проверка shared secret от Gateway
    if INTERNAL_KEY and x_internal_key != INTERNAL_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    session = get_session(body.session_id)

    if session.get("done"):
        return {"reply": "Спасибо! Команда Autogent скоро свяжется с вами.", "done": True}

    if turns_exceeded(session["history"]):
        return {"reply": "Команда Autogent свяжется с вами в течение рабочего дня.", "done": True}

    try:
        safe_msg = sanitize(body.message)
    except InputError as e:
        if "INJECTION_DETECTED" in str(e):
            log.warning("Injection attempt in session %s", body.session_id[:8])
            return {"reply": "Я помогаю только с вопросами об автоматизации бизнеса. Давайте продолжим."}
        raise HTTPException(status_code=422, detail=str(e))

    session["history"].append({"role": "user", "content": safe_msg})

    try:
        response = _openai.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=512,
            temperature=0.7,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + session["history"],
        )
    except Exception as e:
        log.error("OpenAI error: %s", e)
        raise HTTPException(status_code=502, detail="AI error")

    reply = response.choices[0].message.content.strip()
    session["history"].append({"role": "assistant", "content": reply})

    done = detect_done(reply)
    if done:
        session["done"] = True
        log.info("Session %s completed", body.session_id[:8])

    log.info("Session %s | turn %d | tokens %d",
             body.session_id[:8],
             len(session["history"]) // 2,
             response.usage.total_tokens)

    return {
        "reply": reply,
        "show_budget": detect_show_budget(reply),
        "done": done,
        "contact": "",  # контакт храним на gateway, не здесь
    }
