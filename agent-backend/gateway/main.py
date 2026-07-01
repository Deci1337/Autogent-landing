"""
Gateway — runs on 5.35.127.141 (Russian server).
- Принимает сообщения от фронтенда
- Детектирует и хранит ПДн локально в SQLite
- Пересылает ТОЛЬКО обезличенный текст на AI-сервер (151.247.196.36)
- При завершении сессии отправляет карточку лида в Telegram (ПДн добавляются здесь)
"""
import os
import time
import logging
import sqlite3
import asyncio
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv

from pii_detector import detect_and_redact
from telegram_notifier import send_lead_card

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

AI_SERVICE_URL = os.environ["AI_SERVICE_URL"]       # http://151.247.196.36:8001
AI_SERVICE_KEY = os.environ["AI_SERVICE_KEY"]       # обязателен — KeyError если не задан
DB_PATH        = os.getenv("DB_PATH", "/var/lib/autogent/pii.db")

if len(AI_SERVICE_KEY) < 32:
    raise RuntimeError("AI_SERVICE_KEY must be at least 32 characters")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://autogentgroup.ru,https://www.autogentgroup.ru,http://localhost:5173",
).split(",")


# ── SQLite (WAL mode для concurrent writes) ───────────────────────────────────
def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with _db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS pii_log (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                ts         INTEGER NOT NULL,
                kind       TEXT NOT NULL,
                value      TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_session ON pii_log(session_id);

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


def store_pii(session_id: str, found: dict[str, list[str]]) -> None:
    if not found:
        return
    rows = [
        (session_id, int(time.time()), kind, val)
        for kind, values in found.items()
        for val in values
    ]
    with _db() as conn:
        conn.executemany(
            "INSERT INTO pii_log (session_id, ts, kind, value) VALUES (?,?,?,?)", rows
        )
    log.info("Stored %d PII items | session=%s | types=%s",
             len(rows), session_id[:8], list(found.keys()))


def get_pii_for_session(session_id: str) -> dict[str, list[str]]:
    with _db() as conn:
        rows = conn.execute(
            "SELECT kind, value FROM pii_log WHERE session_id=?", (session_id,)
        ).fetchall()
    result: dict[str, list[str]] = {}
    for kind, value in rows:
        result.setdefault(kind, []).append(value)
    return result


def save_lead(session_id: str, answers: dict) -> None:
    with _db() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO leads (session_id, ts, q1, q2, q3, q4, q5, contact, notified)
            VALUES (?,?,?,?,?,?,?,?,0)
        """, (
            session_id, int(time.time()),
            answers.get("q1"), answers.get("q2"), answers.get("q3"),
            answers.get("q4"), answers.get("q5"), answers.get("contact"),
        ))
    log.info("Lead saved | session=%s", session_id[:8])


# ── App ───────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Autogent Gateway", lifespan=lifespan, docs_url=None, redoc_url=None)

limiter = Limiter(key_func=get_remote_address)
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


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "role": "gateway"}


# ── Chat ──────────────────────────────────────────────────────────────────────
@app.post("/chat")
@limiter.limit("15/minute")
async def chat(request: Request, body: ChatRequest):
    # 1. Детектируем ПДн — сохраняем локально, форвардим чистый текст
    pii = detect_and_redact(body.message)
    if pii.has_pii:
        store_pii(body.session_id, pii.found)

    # 2. Форвардим на AI-сервер
    headers = {
        "X-Internal-Key": AI_SERVICE_KEY,
        "X-Session-Id":   body.session_id,
        "Content-Type":   "application/json",
    }
    payload = {"session_id": body.session_id, "message": pii.clean_text}

    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            resp = await client.post(f"{AI_SERVICE_URL}/chat", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI-сервис не ответил вовремя.")
    except httpx.HTTPStatusError as e:
        log.error("AI service HTTP error: %s", e)
        raise HTTPException(status_code=502, detail="Ошибка AI-сервиса.")
    except Exception as e:
        log.error("Gateway forward error: %s", e)
        raise HTTPException(status_code=500, detail="Внутренняя ошибка.")

    # 3. Если сессия завершена — сохраняем лид и шлём Telegram (в фоне)
    if data.get("done") and data.get("answers"):
        answers = data["answers"]
        session_pii = get_pii_for_session(body.session_id)
        save_lead(body.session_id, answers)
        asyncio.create_task(
            send_lead_card(answers, session_pii, body.session_id)
        )

    return data
