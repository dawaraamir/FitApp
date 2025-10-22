import json
import os
from typing import Any, List
from urllib.error import URLError
from urllib.request import urlopen


class ProviderFetchError(Exception):
    """Raised when a provider endpoint cannot be reached."""


def fetch_provider_payload(provider: str, fallback: List[dict]) -> List[dict]:
    """Fetch provider data from a remote API or return the fallback sample."""

    provider_key = provider.lower()
    env_key = f"DAWAR_POWER_{provider_key.upper()}_URL"
    url = os.getenv(env_key)

    if not url:
        return fallback

    try:
        with urlopen(url) as response:  # nosec - trusted local usage
            body = response.read().decode("utf-8")
    except URLError as exc:  # pragma: no cover
        raise ProviderFetchError(str(exc)) from exc

    try:
        payload: Any = json.loads(body)
    except json.JSONDecodeError as exc:
        raise ProviderFetchError("Invalid JSON from provider") from exc

    if isinstance(payload, list):
        return [entry for entry in payload if isinstance(entry, dict)]

    if isinstance(payload, dict):
        entries = payload.get("entries")
        if isinstance(entries, list):
            return [entry for entry in entries if isinstance(entry, dict)]

    raise ProviderFetchError("Provider response is not a list of entries")
