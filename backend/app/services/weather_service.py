from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import urlopen

from app.core.config import VISUAL_CROSSING_API_KEY

VISUAL_CROSSING_BASE_URL = (
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
)


def _require_api_key() -> str:
    if not VISUAL_CROSSING_API_KEY:
        raise RuntimeError(
            "VISUAL_CROSSING_API_KEY is not set. Add it to backend/.env before calling Visual Crossing."
        )

    return VISUAL_CROSSING_API_KEY


def _normalize_date(target_date: str | date) -> str:
    if isinstance(target_date, date):
        return target_date.isoformat()

    normalized = str(target_date).strip()
    if not normalized:
        raise ValueError("target_date must not be empty.")

    return normalized


def _normalize_location(location: str) -> str:
    normalized = location.strip()
    if not normalized:
        raise ValueError("location must not be empty.")

    return normalized


def _build_timeline_url(location: str, target_date: str) -> str:
    api_key = _require_api_key()
    encoded_location = quote(location, safe="")
    encoded_date = quote(target_date, safe="")

    return (
        f"{VISUAL_CROSSING_BASE_URL}/{encoded_location}/{encoded_date}/{encoded_date}"
        f"?unitGroup=metric&include=days&elements=datetime,temp,tempmax,tempmin,humidity,"
        f"windspeed,conditions,description&contentType=json&key={api_key}"
    )


def _extract_day(payload: dict[str, Any]) -> dict[str, Any]:
    days = payload.get("days")
    if not isinstance(days, list) or not days:
        raise RuntimeError("Visual Crossing response did not include a daily result.")

    day = days[0]
    if not isinstance(day, dict):
        raise RuntimeError("Visual Crossing daily result had an unexpected format.")

    return day


def fetch_visual_crossing_daily_weather(
    location: str,
    target_date: str | date,
) -> dict[str, Any]:
    normalized_location = _normalize_location(location)
    normalized_date = _normalize_date(target_date)
    url = _build_timeline_url(normalized_location, normalized_date)

    with urlopen(url) as response:
        payload = json.loads(response.read().decode("utf-8"))

    day = _extract_day(payload)

    return {
        "location": normalized_location,
        "target_date": normalized_date,
        "resolved_address": payload.get("resolvedAddress"),
        "timezone": payload.get("timezone"),
        "day": {
            "datetime": day.get("datetime"),
            "temp": day.get("temp"),
            "tempmax": day.get("tempmax"),
            "tempmin": day.get("tempmin"),
            "humidity": day.get("humidity"),
            "windspeed": day.get("windspeed"),
            "conditions": day.get("conditions"),
            "description": day.get("description"),
        },
        "raw_days_count": len(payload.get("days", [])) if isinstance(payload.get("days"), list) else 0,
    }


def fetch_visual_crossing_daily_weather_for_city(
    city: str,
    country: str,
    target_date: str | date,
) -> dict[str, Any]:
    location = f"{city.strip()}, {country.strip()}"
    return fetch_visual_crossing_daily_weather(location, target_date)
