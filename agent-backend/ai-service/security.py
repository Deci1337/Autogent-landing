"""
Input validation and prompt-injection guards.
"""
import re
import html

# Patterns that indicate prompt injection attempts
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions?",
    r"forget\s+your\s+(system\s+)?prompt",
    r"you\s+are\s+now\s+(a\s+)?",
    r"new\s+instructions?:",
    r"system\s*:\s*",
    r"<\|.*?\|>",              # special tokens
    r"\[INST\]",               # Llama-style
    r"###\s*instruction",
    r"act\s+as\s+(if\s+you\s+are\s+)?",
    r"disregard\s+(your|the)\s+",
    r"override\s+(your\s+)?",
]
_INJECTION_RE = re.compile("|".join(_INJECTION_PATTERNS), re.IGNORECASE)

MAX_MESSAGE_LEN = 500
MAX_TURNS       = 20   # guard against infinite conversations


class InputError(ValueError):
    pass


def sanitize(text: str) -> str:
    """Strip HTML, limit length, detect prompt injection."""
    text = html.escape(text.strip())

    if len(text) > MAX_MESSAGE_LEN:
        raise InputError(f"Сообщение слишком длинное (максимум {MAX_MESSAGE_LEN} символов).")

    if _INJECTION_RE.search(text):
        raise InputError("INJECTION_DETECTED")

    return text


def turns_exceeded(history: list) -> bool:
    return len(history) >= MAX_TURNS * 2
