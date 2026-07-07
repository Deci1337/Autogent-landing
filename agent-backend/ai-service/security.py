"""
Security: input validation, prompt-injection detection, session budget.
"""
import re
import unicodedata

MAX_MESSAGE_LEN = 600
MAX_TURNS       = 18   # 6 questions × 3 turns each max
MAX_TOKENS_SESSION = 8000  # hard budget per session


class InputError(ValueError):
    pass


# Cyrillic chars that look like Latin — map them before ASCII encoding
_LOOKALIKE = {
    ord('а'): 'a',  # а → a
    ord('е'): 'e',  # е → e
    ord('о'): 'o',  # о → o
    ord('р'): 'p',  # р → p
    ord('с'): 'c',  # с → c
    ord('у'): 'y',  # у → y
    ord('х'): 'x',  # х → x
    ord('А'): 'A',  # А → A
    ord('В'): 'B',  # В → B
    ord('Е'): 'E',  # Е → E
    ord('К'): 'K',  # К → K
    ord('М'): 'M',  # М → M
    ord('Н'): 'H',  # Н → H
    ord('О'): 'O',  # О → O
    ord('Р'): 'P',  # Р → P
    ord('С'): 'C',  # С → C
    ord('Т'): 'T',  # Т → T
    ord('Х'): 'X',  # Х → X
}

def _normalize(text: str) -> str:
    """Lowercase + remove combining chars + substitute cyrillic lookalikes → defeat unicode obfuscation."""
    t = unicodedata.normalize("NFKD", text)
    t = t.translate(_LOOKALIKE)
    t = t.encode("ascii", "ignore").decode().lower()
    return t


# English + Russian injection patterns
_INJECTION_PATTERNS = [
    # English
    r"ignore\s+(all\s+)?previous\s+instructions?",
    r"forget\s+your\s+(system\s+)?prompt",
    r"you\s+are\s+now\b",
    r"new\s+instructions?\s*:",
    r"system\s*prompt\s*:",
    r"<\|.*?\|>",
    r"\[INST\]",
    r"###\s*instruction",
    r"act\s+as\s+if",
    r"disregard\s+(your|the)\s+",
    r"override\s+your\s+",
    r"jailbreak",
    r"pretend\s+you\s+are",
    r"roleplay\s+as",
    # Russian
    r"игнорир\w+.{0,25}инструкци",
    r"забудь\s+все\s+(предыдущие\s+)?инструкци",
    r"теперь\s+ты\b",
    r"ты\s+теперь\b",
    r"новые\s+инструкции\s*:",
    r"системный\s+промпт",
    r"представь\s+(что\s+ты|себя)",
    r"притворись\b",
    r"сыграй\s+роль",
    r"выйди\s+из\s+роли",
    r"ты\s+не\s+(ассистент|бот|агент)",
]

_INJECTION_RE = re.compile("|".join(_INJECTION_PATTERNS), re.IGNORECASE | re.UNICODE)


def sanitize(text: str) -> str:
    """Validate length and detect prompt injection. Returns clean text (no html.escape)."""
    text = text.strip()

    if not text:
        raise InputError("Пустое сообщение.")

    if len(text) > MAX_MESSAGE_LEN:
        raise InputError(f"Сообщение слишком длинное (максимум {MAX_MESSAGE_LEN} символов).")

    # Check both raw and normalized text
    if _INJECTION_RE.search(text) or _INJECTION_RE.search(_normalize(text)):
        raise InputError("INJECTION_DETECTED")

    return text


def turns_exceeded(history: list) -> bool:
    return len(history) >= MAX_TURNS * 2


def budget_exceeded(total_tokens: int) -> bool:
    return total_tokens >= MAX_TOKENS_SESSION
