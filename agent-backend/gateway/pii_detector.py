"""
PII detection and redaction for Russian text.
Detects: phone numbers, emails, Telegram handles, full names, company names.
PII never leaves this server — only redacted text is forwarded to AI service.
"""
import re
from dataclasses import dataclass, field


@dataclass
class PiiResult:
    clean_text: str
    found: dict[str, list[str]] = field(default_factory=dict)

    @property
    def has_pii(self) -> bool:
        return any(self.found.values())


_PATTERNS: list[tuple[str, re.Pattern]] = [
    # Телефон: +7/8 (xxx) xxx-xx-xx и вариации
    ("phone", re.compile(
        r'(?:\+7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}'
        r'|\b\d{10,11}\b',
        re.IGNORECASE,
    )),
    # Email
    ("email", re.compile(
        r'\b[\w.+\-]+@[\w\-]+\.[a-z]{2,}\b',
        re.IGNORECASE,
    )),
    # Telegram @username
    ("telegram", re.compile(
        r'(?<!\w)@[\w]{3,32}',
    )),
    # ООО / ИП / АО + название
    ("company", re.compile(
        r'(?:ООО|ОАО|ЗАО|ИП|АО|ПАО|НКО)\s+[«"]?[\w\s]{2,40}[»"]?',
        re.IGNORECASE | re.UNICODE,
    )),
    # ФИО — три заглавных слова на кириллице подряд (Фамилия Имя Отчество)
    # или два (Имя Фамилия)
    ("name", re.compile(
        r'\b[А-ЯЁ][а-яё]{1,20}(?:\s+[А-ЯЁ][а-яё]{1,20}){1,2}\b',
        re.UNICODE,
    )),
]

_PLACEHOLDER = {
    "phone":    "[ТЕЛЕФОН]",
    "email":    "[EMAIL]",
    "telegram": "[ТЕЛЕГРАМ]",
    "company":  "[КОМПАНИЯ]",
    "name":     "[ИМЯ]",
}


def detect_and_redact(text: str) -> PiiResult:
    found: dict[str, list[str]] = {}
    clean = text

    for kind, pattern in _PATTERNS:
        matches = pattern.findall(clean)
        if matches:
            found[kind] = matches
            clean = pattern.sub(_PLACEHOLDER[kind], clean)

    return PiiResult(clean_text=clean, found=found)
