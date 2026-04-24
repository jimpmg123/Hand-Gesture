from __future__ import annotations

import re

from app.services.search.contracts import SearchHintContext


def _normalize_hint_token(value: str | None) -> str | None:
    if not value:
        return None

    normalized = re.sub(r"[^a-z0-9]+", "", value.lower())
    return normalized or None


def country_matches_hint(resolved_country: str | None, hints: SearchHintContext) -> bool:
    hint_country = _normalize_hint_token(hints.normalized_country())
    if not hint_country:
        return True

    resolved = _normalize_hint_token(resolved_country)
    if not resolved:
        return False

    return resolved == hint_country


def build_country_mismatch_reason(resolved_country: str | None, hints: SearchHintContext) -> str:
    expected = hints.normalized_country() or "unknown"
    actual = resolved_country or "unknown"
    return f"Resolved country '{actual}' does not match the provided country hint '{expected}'."
