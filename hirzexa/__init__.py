# Suppress only the known numpy MINGW warning that crashes Python 3.14 on Windows.
# All other warnings should surface — blanket suppression hides real bugs.
import warnings
import os
warnings.filterwarnings('ignore', message='.*Numpy built with MINGW.*')
os.environ.setdefault('PYTHONWARNINGS', 'default')

# Keep pre-rebrand deployments working: mirror legacy AEGIS_* variables to
# HIRZEXA_* (new names always win). Must run before any settings are read.
from hirzexa._legacy_env import apply_legacy_env_aliases as _apply_legacy_env_aliases
_LEGACY_ENV_MIRRORED = _apply_legacy_env_aliases()

# Configure structured logging on first import
from hirzexa.core.logging import setup_logging as _setup_logging
_setup_logging(
    debug=os.getenv("HIRZEXA_DEBUG", "").lower() in ("1", "true", "yes"),
    level=os.getenv("HIRZEXA_LOG_LEVEL") or None,
)
if _LEGACY_ENV_MIRRORED:
    import logging as _logging
    _logging.getLogger("hirzexa").warning(
        "Deprecated AEGIS_* configuration detected (%d keys); rename them to HIRZEXA_*.",
        len(_LEGACY_ENV_MIRRORED),
    )

"""
HIRZEXA - AI-Powered Threat Detection & Public Safety Intelligence
Detect Early. Protect Better.
Core Package

Phase 1: Perception Layer (Detection + Tracking)
Phase 2: Analysis Layer (Motion + Behavior + Crowd)
Phase 3: Risk Intelligence Layer
Phase 4: Response Layer (API + Alerts)
Phase 5: Semantic Intelligence Layer
Phase 6: Edge/Cloud Hybrid Intelligence

Copyright 2024 Hirzexa Project
"""

__version__ = "5.0.0"
__phase__ = "Phase 0-6 | AI Security Operating System"
__author__ = "Hirzexa Team"

# Phase 1 exports (conditional - requires ultralytics)
try:
    from hirzexa.detection.yolo_detector import YOLODetector, Detection
    _PHASE1_EXPORTS = [
        "YOLODetector",
        "Detection",
    ]
except ImportError:
    _PHASE1_EXPORTS = []

# Phase 1 tracking (ByteTrack - default, DeepSORT - optional)
try:
    from hirzexa.tracking.bytetrack_tracker import ByteTrackTracker
    _TRACKING_EXPORTS = ["ByteTrackTracker"]
except ImportError:
    _TRACKING_EXPORTS = []

try:
    from hirzexa.tracking.deepsort_tracker import DeepSORTTracker
    _TRACKING_EXPORTS.append("DeepSORTTracker")
except ImportError:
    pass

# Phase 1 risk (ProximityRiskEngine - lightweight CPU)
try:
    from hirzexa.risk.proximity_risk import ProximityRiskEngine, ProximityRiskAssessment
    _RISK_EXPORTS = ["ProximityRiskEngine", "ProximityRiskAssessment"]
except ImportError:
    _RISK_EXPORTS = []

# Phase 1 edge pipeline
try:
    from hirzexa.edge.edge_pipeline import EdgePipeline
    from hirzexa.edge.pipeline_types import PipelineResult
    _EDGE_EXPORTS = ["EdgePipeline", "PipelineResult"]
except ImportError:
    _EDGE_EXPORTS = []

# Phase 2 exports (conditional)
try:
    from hirzexa.analysis import (
        TrackHistoryManager,
        MotionAnalyzer,
        BehaviorAnalyzer,
        CrowdAnalyzer,
        FrameAnalysis,
        TrackAnalysis,
        MotionState,
        BehaviorFlags,
        CrowdMetrics
    )
    _ANALYSIS_EXPORTS = [
        "TrackHistoryManager",
        "MotionAnalyzer",
        "BehaviorAnalyzer",
        "CrowdAnalyzer",
        "FrameAnalysis",
        "TrackAnalysis",
        "MotionState",
        "BehaviorFlags",
        "CrowdMetrics"
    ]
except ImportError:
    _ANALYSIS_EXPORTS = []

# Phase 6 cloud exports (lightweight dependencies)
try:
    from hirzexa.edge.edge_risk_filter import EdgeRiskFilter
    from hirzexa.edge.event_types import EdgeAssessment, SuspiciousEvent, TrackSummary
    from hirzexa.cloud.cloud_client import CloudClient
    from hirzexa.cloud.cloud_types import CloudVerdict
    _CLOUD_EXPORTS = [
        "EdgeRiskFilter",
        "EdgeAssessment",
        "SuspiciousEvent",
        "TrackSummary",
        "CloudClient",
        "CloudVerdict",
    ]
except ImportError:
    _CLOUD_EXPORTS = []

__all__ = (
    _PHASE1_EXPORTS + _TRACKING_EXPORTS + _RISK_EXPORTS +
    _EDGE_EXPORTS + _ANALYSIS_EXPORTS + _CLOUD_EXPORTS
)

