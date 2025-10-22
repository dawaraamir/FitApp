#!/usr/bin/env python3
"""Quick CLI to pull wellness metrics from the Dawar Power backend.

Usage:
  python tools/pull_wellness.py provider_name [--base-url http://localhost:8080]
  python tools/pull_wellness.py import provider_name
"""

import argparse
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "http://localhost:8080"


def fetch_metrics(provider: str, base_url: str) -> None:
    url = f"{base_url}/fit/wellness-sync/provider/{provider}"
    try:
        with urlopen(url) as resp:  # nosec - local dev usage
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        print(f"Request failed: {exc.code} {exc.reason}", file=sys.stderr)
        sys.exit(1)
    except URLError as exc:
        print(f"Could not reach backend: {exc.reason}", file=sys.stderr)
        sys.exit(2)
    print(json.dumps(data, indent=2))


def import_metrics(provider: str, base_url: str) -> None:
    url = f"{base_url}/fit/wellness-sync/import"
    sample_url = f"{base_url}/fit/wellness-sync/provider/{provider}"
    try:
        with urlopen(sample_url) as resp:
            entries = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to fetch sample data: {exc}", file=sys.stderr)
        sys.exit(1)

    payload = json.dumps({"source": provider, "entries": entries}).encode("utf-8")
    request = Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(request) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        print(f"Import failed: {exc.code} {exc.reason}", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(data, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Interact with Dawar Power wellness sync API")
    parser.add_argument("provider", help="Provider to fetch, e.g. apple_health, fitbit, whoop")
    parser.add_argument("action", nargs="?", default="fetch", choices=["fetch", "import"], help="Fetch sample or import it")
    parser.add_argument("--base-url", dest="base_url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    if args.action == "fetch":
        fetch_metrics(args.provider, args.base_url)
    else:
        import_metrics(args.provider, args.base_url)
if __name__ == "__main__":
    main()
