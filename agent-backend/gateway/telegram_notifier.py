"""
Sends qualified lead cards to Telegram super-admins via Bot API.
Runs on the Russian server (5.35.127.141) — PII is added here before sending.
"""
import os
import html
import logging
import httpx

log = logging.getLogger(__name__)

BOT_TOKEN   = os.environ["TELEGRAM_BOT_TOKEN"]
SUPER_ADMINS: list[int] = [
    int(x.strip()) for x in os.environ["TELEGRAM_SUPER_ADMINS"].split(",") if x.strip()
]

_TG_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


def _format_card(answers: dict, pii: dict, session_id: str) -> str:
    """Format a lead card for Telegram (HTML parse_mode)."""
    def v(key: str) -> str:
        val = answers.get(key)
        # html.escape prevents Telegram HTML parse errors on user-provided text
        return html.escape(str(val).strip()) if val else "—"

    # Restore real contact from PII store (override AI-extracted placeholder)
    contact_pii = ""
    if pii.get("telegram"):
        contact_pii = html.escape(", ".join(pii["telegram"]))
    elif pii.get("phone"):
        contact_pii = html.escape(", ".join(pii["phone"]))
    contact = contact_pii or v("contact")

    lines = [
        "🎯 <b>Новый квалифицированный лид</b>",
        "",
        f"<b>1. Компания / деятельность:</b>",
        f"   {v('q1')}",
        "",
        f"<b>2. Задача для ИИ:</b>",
        f"   {v('q2')}",
        "",
        f"<b>3. Опыт с ИИ:</b>",
        f"   {v('q3')}",
        "",
        f"<b>4. Бюджет:</b>",
        f"   {v('q4')}",
        "",
        f"<b>5. Инструменты (CRM и др.):</b>",
        f"   {v('q5')}",
        "",
        f"<b>📞 Контакт:</b>",
        f"   <code>{contact}</code>",
        "",
        f"<i>Session: {session_id[:12]}…</i>",
    ]
    return "\n".join(lines)


async def send_lead_card(answers: dict, pii: dict, session_id: str) -> None:
    """Send lead card to all super-admins asynchronously."""
    text = _format_card(answers, pii, session_id)

    async with httpx.AsyncClient(timeout=10.0) as client:
        for admin_id in SUPER_ADMINS:
            try:
                resp = await client.post(
                    f"{_TG_API}/sendMessage",
                    json={
                        "chat_id":    admin_id,
                        "text":       text,
                        "parse_mode": "HTML",
                    },
                )
                data = resp.json()
                if resp.status_code != 200 or not data.get("ok"):
                    log.error("TG send failed for admin %d: HTTP %d | %s",
                              admin_id, resp.status_code, data.get("description", resp.text))
                else:
                    log.info("Lead card sent to admin %d", admin_id)
            except Exception as e:
                log.error("TG send error for admin %d: %s", admin_id, e)
