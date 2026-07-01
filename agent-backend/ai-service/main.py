"""
AI Service — runs on 151.247.196.36
ВАЖНО: ПДн сюда НЕ поступают. Принимает только обезличенные сообщения от Gateway.
"""
import os
import time
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from openai import AsyncOpenAI, APITimeoutError, APIError
from dotenv import load_dotenv

from funnel import (
    SYSTEM_PROMPT, detect_show_budget, detect_done,
    extract_answers_from_history,
)
from security import sanitize, turns_exceeded, budget_exceeded, InputError

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── REQUIRED: INTERNAL_KEY must be set ────────────────────────────────────────
INTERNAL_KEY = os.environ["INTERNAL_KEY"]
if len(INTERNAL_KEY) < 32:
    raise RuntimeError("INTERNAL_KEY must be at least 32 characters")

_openai = AsyncOpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    timeout=25.0,
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
            "budget_shown":  False,
        }
    return sessions[sid]


def cleanup_sessions() -> None:
    now = time.time()
    expired = [k for k, v in sessions.items() if now - v["created_at"] > SESSION_TTL]
    for k in expired:
        del sessions[k]
    if expired:
        log.info("Cleaned up %d expired sessions", len(expired))


async def _periodic_cleanup() -> None:
    while True:
        await asyncio.sleep(600)
        cleanup_sessions()


# ── Rate limiter keyed by session_id ──────────────────────────────────────────
def _session_key(request: Request) -> str:
    try:
        return request.headers.get("X-Session-Id") or (
            request.client.host if request.client else "unknown"
        )
    except Exception:
        return "unknown"


limiter = Limiter(key_func=_session_key)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("AI Service starting | model=%s | NO PII", MODEL)
    task = asyncio.create_task(_periodic_cleanup())
    yield
    task.cancel()
    log.info("AI Service shutting down")


app = FastAPI(title="Autogent AI Service", lifespan=lifespan, docs_url=None, redoc_url=None)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


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
        session["done"] = True
        log.info("Session %s: max turns exceeded", body.session_id[:8])
        return {"reply": "Спасибо за диалог! Команда Autogent свяжется с вами в течение рабочего дня.", "done": True, "answers": None}

    if budget_exceeded(session["total_tokens"]):
        session["done"] = True
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

    # ── 4. Вызов OpenAI (async — не блокирует event loop) ────────────────────
    try:
        response = await _openai.chat.completions.create(
            model=MODEL,
            max_tokens=400,
            temperature=0.65,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + session["history"],
        )
    except APITimeoutError:
        session["history"].pop()
        log.error("OpenAI timeout | session=%s", body.session_id[:8])
        raise HTTPException(status_code=504, detail="AI timeout")
    except APIError as e:
        session["history"].pop()
        log.error("OpenAI API error: %s | session=%s", e, body.session_id[:8])
        raise HTTPException(status_code=502, detail="AI error")

    # choices[0].message.content can be None on content_filter finish_reason
    content = response.choices[0].message.content
    if not content:
        session["history"].pop()
        log.warning("OpenAI returned empty content | session=%s", body.session_id[:8])
        raise HTTPException(status_code=502, detail="AI returned empty response")

    reply = content.strip()
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
        # Contact comes from gateway's SQLite PII store, not from here.
        # extract_answers_from_history returns dict with q1..q5; contact is overwritten by gateway.
        answers = await extract_answers_from_history(session["history"], _openai, MODEL)
        log.info("Session %s DONE | tokens=%d", body.session_id[:8], session["total_tokens"])

    log.info("Session %s | turn=%d | tokens_total=%d | done=%s",
             body.session_id[:8], len(session["history"]) // 2, session["total_tokens"], done)

    return {
        "reply":       reply,
        "show_budget": show_budget,
        "done":        done,
        "answers":     answers,
    }
