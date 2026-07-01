"""
PII detection and redaction for Russian text.
Strips: phones, emails, Telegram, company names, full names (FIO).
"""
import re
from dataclasses import dataclass, field


@dataclass
class PiiResult:
    clean_text: str
    found: dict[str, list[str]] = field(default_factory=dict)

    @property
    def has_pii(self) -> bool:
        return bool(self.found)


_PATTERNS: list[tuple[str, re.Pattern]] = [
    # Телефон: +7/8 (xxx) xxx-xx-xx, 10-11 цифр подряд
    ("phone", re.compile(
        r'(?:\+7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}'
        r'|\b[78]\d{10}\b',
        re.UNICODE,
    )),
    # Email
    ("email", re.compile(
        r'\b[\w.+\-]{1,64}@[\w\-]{1,63}(?:\.[\w\-]{1,63})+\b',
        re.IGNORECASE | re.UNICODE,
    )),
    # Telegram @username (3–32 символа)
    ("telegram", re.compile(
        r'(?<!\w)@[A-Za-z0-9_]{3,32}\b',
    )),
    # Юр. лица: ООО/ИП/АО/ПАО/ЗАО + название в кавычках или без
    ("company", re.compile(
        r'(?:ООО|ОАО|ЗАО|ИП|АО(?![\w])|ПАО|НКО)\s+(?:[«""][\w\s\-]{2,50}[»""]|[А-ЯЁA-Z][\w\s\-]{1,40})',
        re.UNICODE,
    )),
    # ФИО: 2–3 идущих подряд слова с заглавной буквы кириллицей
    # Исключаем одиночные слова и распространённые не-имена
    ("name", re.compile(
        r'\b[А-ЯЁ][а-яё]{1,20}\s+[А-ЯЁ][а-яё]{1,20}(?:\s+[А-ЯЁ][а-яё]{1,20})?\b',
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

# Слова которые не являются именами (исключения для name-паттерна)
_NAME_STOPWORDS = {
    "Это", "Наша", "Наш", "Наши", "Мы", "Они", "Вы", "Ваш", "Ваша",
    "Есть", "Нет", "Был", "Была", "Было", "Будет", "Стало",
    "Хотим", "Можем", "Делаем", "Работаем", "Используем",
}


def _filter_name_matches(matches: list[str]) -> list[str]:
    return [m for m in matches if not any(m.startswith(sw) for sw in _NAME_STOPWORDS)]


def detect_and_redact(text: str) -> PiiResult:
    found: dict[str, list[str]] = {}
    clean = text

    for kind, pattern in _PATTERNS:
        matches = pattern.findall(clean)
        if kind == "name":
            matches = _filter_name_matches(matches)
        if matches:
            found[kind] = matches
            clean = pattern.sub(_PLACEHOLDER[kind], clean)

    return PiiResult(clean_text=clean, found=found)
