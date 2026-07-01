"""
Gateway — runs on 5.35.127.141 (Russian server).

Fixes applied:
- load_dotenv() called BEFORE local imports (was causing startup crash)
- SQLite connections explicitly closed (context manager only commits, doesn't close)
- Blocking SQLite calls wrapped in asyncio.to_thread()
- asyncio.create_task exception logging
- os.makedirs guard for empty dirname
- Partial lead saved even when done=True with answers=None (turns/budget exceeded)
"""
import os

# ── CRITICAL: load_dotenv BEFORE any local imports that read os.environ ───────
from dotenv import load_dotenv
load_dotenv()

import time
import logging
import sqlite3
import asyncio
import httpx
from contextlib import asynccontextmanager, closing

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from pii_detector import detect_and_redact
from telegram_notifier import send_lead_card

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

AI_SERVICE_URL = os.environ["AI_SERVICE_URL"]
AI_SERVICE_KEY = os.environ["AI_SERVICE_KEY"]
DB_PATH        = os.getenv("DB_PATH", "/var/lib/autogent/pii.db")

if len(AI_SERVICE_KEY) < 32:
    raise RuntimeError("AI_SERVICE_KEY must be at least 32 characters")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://autogentgroup.ru,https://www.autogentgroup.ru,http://localhost:5173",
).split(",")


# ── SQLite helpers ────────────────────────────────────────────────────────────
def _connect() -> sqlite3.Connection:
    """Open a WAL-mode connection. Always call .close() when done."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    with closing(_connect()) as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS pii_log (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                ts         INTEGER NOT NULL,
                kind       TEXT NOT NULL,
                value      TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_pii_session ON pii_log(session_id);

            CREATE TABLE IF NOT EXISTS leads (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL UNIQUE,
                ts         INTEGER NOT NULL,
                q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT, q5 TEXT,
                contact    TEXT,
                notified   INTEGER DEFAULT 0
            );
        """)
    log.info("SQLite ready (WAL): %s", DB_PATH)


def _store_pii_sync(session_id: str, found: dict[str, list[str]]) -> None:
    if not found:
        return
    rows = [
        (session_id, int(time.time()), kind, val)
        for kind, values in found.items()
        for val in values
    ]
    with closing(_connect()) as conn:
        conn.executemany(
            "INSERT INTO pii_log (session_id, ts, kind, value) VALUES (?,?,?,?)", rows
        )
        conn.commit()
    log.info("Stored %d PII | session=%s | types=%s",
             len(rows), session_id[:8], list(found.keys()))


def _get_pii_sync(session_id: str) -> dict[str, list[str]]:
    with closing(_connect()) as conn:
        rows = conn.execute(
            "SELECT kind, value FROM pii_log WHERE session_id=?", (session_id,)
        ).fetchall()
    result: dict[str, list[str]] = {}
    for kind, value in rows:
        result.setdefault(kind, []).append(value)
    return result


def _save_lead_sync(session_id: str, answers: dict) -> None:
    with closing(_connect()) as conn:
        conn.execute("""
            INSERT OR IGNORE INTO leads (session_id, ts, q1, q2, q3, q4, q5, contact, notified)
            VALUES (?,?,?,?,?,?,?,?,0)
        """, (
            session_id, int(time.time()),
            answers.get("q1"), answers.get("q2"), answers.get("q3"),
            answers.get("q4"), answers.get("q5"), answers.get("contact"),
        ))
        conn.commit()
    log.info("Lead saved | session=%s | contact=%s", session_id[:8], answers.get("contact", "—"))


# Async wrappers — run blocking SQLite in thread pool
async def store_pii(session_id: str, found: dict) -> None:
    await asyncio.to_thread(_store_pii_sync, session_id, found)

async def get_pii(session_id: str) -> dict:
    return await asyncio.to_thread(_get_pii_sync, session_id)

async def save_lead(session_id: str, answers: dict) -> None:
    await asyncio.to_thread(_save_lead_sync, session_id, answers)


# ── App ───────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(init_db)
    yield


app = FastAPI(title="Autogent Gateway", lifespan=lifespan, docs_url=None, redoc_url=None)

def _client_ip(request: Request) -> str:
    """Real client IP — reads X-Real-IP set by nginx, falls back to client.host."""
    return (
        request.headers.get("X-Real-IP")
        or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )


limiter = Limiter(key_func=_client_ip)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RateLimitExceeded)
async def _rate(req: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Слишком много запросов."})


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
        v = v.strip()
        if not v:
            raise ValueError("Empty message")
        if len(v) > 800:
            raise ValueError("Сообщение слишком длинное (максимум 800 символов).")
        return v


@app.get("/health")
async def health():
    return {"status": "ok", "role": "gateway"}


@app.post("/chat")
@limiter.limit("15/minute")
async def chat(request: Request, body: ChatRequest):
    # 1. PII detection — run async, store locally
    pii = detect_and_redact(body.message)
    if pii.has_pii:
        await store_pii(body.session_id, pii.found)

    # 2. Forward clean message to AI service
    headers = {
        "X-Internal-Key": AI_SERVICE_KEY,
        "X-Session-Id":   body.session_id,
        "Content-Type":   "application/json",
    }
    payload = {"session_id": body.session_id, "message": pii.clean_text}

    try:
        async with httpx.AsyncClient(timeout=40.0) as client:
            resp = await client.post(f"{AI_SERVICE_URL}/chat", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI-сервис не ответил вовремя.")
    except httpx.HTTPStatusError as e:
        log.error("AI service HTTP %s: %s", e.response.status_code, e)
        raise HTTPException(status_code=502, detail="Ошибка AI-сервиса.")
    except Exception as e:
        log.error("Gateway forward error: %s", e)
        raise HTTPException(status_code=500, detail="Внутренняя ошибка.")

    # 3. On session completion — save lead and notify Telegram in background
    if data.get("done"):
        answers = data.get("answers") or {}
        # Restore real PII contact from local store (overrides AI-redacted placeholder)
        session_pii = await get_pii(body.session_id)
        if session_pii.get("telegram"):
            answers["contact"] = session_pii["telegram"][-1]
        elif session_pii.get("phone"):
            answers["contact"] = session_pii["phone"][-1]

        await save_lead(body.session_id, answers)

        # Fire-and-forget Telegram notification with proper error logging
        async def _notify() -> None:
            try:
                await send_lead_card(answers, session_pii, body.session_id)
            except Exception as exc:
                log.error("Telegram notification failed | session=%s | %s",
                          body.session_id[:8], exc)

        asyncio.create_task(_notify())

    return data
