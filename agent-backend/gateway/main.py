"""
Gateway service — runs on 5.35.127.141
- Принимает сообщения от фронтенда
- Детектирует и хранит ПДн локально (SQLite)
- Пересылает ТОЛЬКО обезличенный текст на AI-сервер
- ПДн НИКОГДА не покидают этот сервер
"""
import os
import time
import logging
import sqlite3
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

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

AI_SERVICE_URL = os.environ["AI_SERVICE_URL"]          # http://151.247.196.36:8001
AI_SERVICE_KEY = os.environ.get("AI_SERVICE_KEY", "")  # shared secret между серверами
DB_PATH        = os.getenv("DB_PATH", "/var/lib/autogent/pii.db")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://autogentgroup.ru,https://www.autogentgroup.ru,http://localhost:5173",
).split(",")


# ── SQLite для хранения ПДн ────────────────────────────────────────────────────
def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pii_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id  TEXT NOT NULL,
                ts          INTEGER NOT NULL,
                kind        TEXT NOT NULL,
                value       TEXT NOT NULL
            )
        """)
        conn.commit()
    log.info("SQLite PII store ready: %s", DB_PATH)


def store_pii(session_id: str, found: dict[str, list[str]]) -> None:
    if not found:
        return
    rows = [
        (session_id, int(time.time()), kind, val)
        for kind, values in found.items()
        for val in values
    ]
    with sqlite3.connect(DB_PATH) as conn:
        conn.executemany(
            "INSERT INTO pii_log (session_id, ts, kind, value) VALUES (?,?,?,?)", rows
        )
        conn.commit()
    log.info("Stored %d PII items for session %s", len(rows), session_id[:8])


# ── App setup ─────────────────────────────────────────────────────────────────
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
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Слишком много запросов."})


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        if len(v) > 64 or not v.replace("-", "").isalnum():
            raise ValueError("Invalid session_id")
        return v

    @field_validator("message")
    @classmethod
    def validate_msg(cls, v: str) -> str:
        if len(v) > 1000:
            raise ValueError("Сообщение слишком длинное")
        return v.strip()


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "role": "gateway"}


@app.post("/chat")
@limiter.limit("15/minute")
async def chat(request: Request, body: ChatRequest):
    # 1. Детектируем и удаляем ПДн
    pii = detect_and_redact(body.message)

    # 2. ПДн сохраняем ЛОКАЛЬНО — на AI-сервер не уходят
    if pii.has_pii:
        store_pii(body.session_id, pii.found)
        log.info("PII detected in session %s: %s", body.session_id[:8], list(pii.found.keys()))

    # 3. Пересылаем обезличенный текст на AI-сервер
    headers = {"X-Internal-Key": AI_SERVICE_KEY} if AI_SERVICE_KEY else {}
    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            resp = await client.post(
                f"{AI_SERVICE_URL}/chat",
                json={"session_id": body.session_id, "message": pii.clean_text},
                headers=headers,
            )
        resp.raise_for_status()
        return resp.json()

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI-сервис не ответил вовремя.")
    except httpx.HTTPStatusError as e:
        log.error("AI service error: %s", e)
        raise HTTPException(status_code=502, detail="Ошибка AI-сервиса.")
    except Exception as e:
        log.error("Gateway error: %s", e)
        raise HTTPException(status_code=500, detail="Внутренняя ошибка.")
