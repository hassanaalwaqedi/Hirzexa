"""Backward compatibility for pre-rebrand environment variables.

The project was renamed from AEGIS AI to HIRZEXA and every configuration key
moved from the ``AEGIS_`` prefix to ``HIRZEXA_``.  Existing deployments may
still export the legacy names (container secrets, CI variables, an un-migrated
``.env``).  To keep those installations operational, each legacy variable is
mirrored to its ``HIRZEXA_`` equivalent *only when the new name is not already
configured*.  New names always take precedence.  This module must run before
any settings object is instantiated, so it is invoked from ``hirzexa/__init__``.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Dict, List

LEGACY_PREFIX = "AEGIS_"
CURRENT_PREFIX = "HIRZEXA_"
_ENV_LINE = re.compile(r"^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$")


def _read_dotenv(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    try:
        content = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return values
    for line in content.splitlines():
        match = _ENV_LINE.match(line)
        if not match:
            continue
        key, value = match.group(1), match.group(2)
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        values[key] = value
    return values


def apply_legacy_env_aliases(dotenv_path: Path | None = None) -> List[str]:
    """Mirror legacy ``AEGIS_*`` settings to ``HIRZEXA_*``; return mirrored names."""
    resolved_path = dotenv_path or (Path.cwd() / ".env")
    if not resolved_path.exists() and (Path(__file__).parent.parent / ".env").exists():
        resolved_path = Path(__file__).parent.parent / ".env"

    dotenv = _read_dotenv(resolved_path)
    mirrored: List[str] = []

    # Populate standard .env values into os.environ if absent
    for k, v in dotenv.items():
        if k not in os.environ:
            os.environ[k] = v

    # Compatibility: if DATABASE_URL points to aegis.db and hirzexa.db exists, point to hirzexa.db
    db_url = os.environ.get("DATABASE_URL")
    if db_url and "aegis.db" in db_url:
        target_path = Path("data/hirzexa.db")
        if target_path.exists() or not Path("data/aegis.db").exists():
            os.environ["DATABASE_URL"] = db_url.replace("aegis.db", "hirzexa.db")

    # Mirror AEGIS_ -> HIRZEXA_
    for source in (dict(os.environ), dotenv):
        for key, value in source.items():
            if key.startswith(LEGACY_PREFIX):
                new_key = CURRENT_PREFIX + key[len(LEGACY_PREFIX):]
                if new_key not in os.environ:
                    os.environ[new_key] = value
                    mirrored.append(key)

    # Mirror HIRZEXA_ -> AEGIS_ for backward compat with any external processes
    for key, value in list(os.environ.items()):
        if key.startswith(CURRENT_PREFIX):
            legacy_key = LEGACY_PREFIX + key[len(CURRENT_PREFIX):]
            if legacy_key not in os.environ:
                os.environ[legacy_key] = value

    return mirrored
