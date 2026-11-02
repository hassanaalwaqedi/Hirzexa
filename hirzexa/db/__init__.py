"""
Hirzexa - Database Module (DEPRECATED)

DEPRECATION NOTICE: This package is superseded by ``hirzexa.database``.
All new code should use ``hirzexa.database`` directly.

This module remains for backward compatibility only. It re-exports from
``hirzexa.database`` where possible, but will be removed in a future version.
"""

import warnings

warnings.warn(
    "hirzexa.db is deprecated. Use hirzexa.database instead.",
    DeprecationWarning,
    stacklevel=2,
)

# Re-export from the canonical hirzexa.database package
from hirzexa.database.connection import (  # noqa: F401
    Base,
    get_engine,
    get_session,
    create_tables as init_db,
)
from hirzexa.database.models import (  # noqa: F401
    Event as EventModel,
    Alert as AlertModel,
)
from hirzexa.database.repositories import (  # noqa: F401
    EventRepository,
    AlertRepository,
)

__all__ = [
    "init_db",
    "get_engine",
    "get_session",
    "Base",
    "EventModel",
    "AlertModel",
    "EventRepository",
    "AlertRepository",
]
