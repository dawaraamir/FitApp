import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

_STORAGE_PATH = Path(__file__).with_name("storage.json")


def load_storage() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    if not _STORAGE_PATH.exists():
        return {}, []
    try:
        payload = json.loads(_STORAGE_PATH.read_text(encoding="utf-8"))
        schedules = payload.get("schedules", {})
        wellness = payload.get("wellness", [])
        if not isinstance(schedules, dict):
            schedules = {}
        if not isinstance(wellness, list):
            wellness = []
        return schedules, wellness
    except json.JSONDecodeError:
        return {}, []


def save_storage(schedules: Dict[str, Any], wellness: List[Dict[str, Any]]) -> None:
    payload = {
        "schedules": schedules,
        "wellness": wellness[-200:],  # keep cap
    }
    _STORAGE_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
