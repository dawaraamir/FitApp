#!/usr/bin/env python3
"""Verify schedule persistence for a given profile payload."""

import argparse
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PROFILE_SAMPLE = {
    "fullName": "CLI Check",
    "occupation": "Engineer",
    "workStyle": "remote",
    "timezone": "UTC",
    "goal": "maintain",
    "preferredWindows": ["midday", "evening"],
    "equipmentAccess": ["bodyweight"],
    "dietPreference": "standard",
    "stressLevel": "moderate",
}


def post(url: str, payload: dict) -> dict:
    request = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urlopen(request) as response:  # nosec - local backend
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Check that schedules persist across requests")
    parser.add_argument("--base-url", default="http://localhost:8080")
    args = parser.parse_args()

    schedule_url = f"{args.base_url}/fit/schedule"
    fetch_url = f"{args.base_url}/fit/schedule/fetch"

    try:
        schedule = post(schedule_url, PROFILE_SAMPLE)
        fetched = post(fetch_url, PROFILE_SAMPLE)
    except (HTTPError, URLError) as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    if schedule != fetched:
        print("Mismatch between generated and fetched schedule", file=sys.stderr)
        sys.exit(2)

    print(json.dumps(fetched, indent=2))

+
+if __name__ == "__main__":
+    main()
