"""
Hirzexa - Smart City Risk Intelligence System
Analysis Module

Phase 2: Analysis Layer
Transforms raw detection + tracking data into behavioral intelligence.

Components:
- TrackHistoryManager: Per-track time series storage
- MotionAnalyzer: Speed, direction, acceleration computation
- BehaviorAnalyzer: Anomaly and behavior detection
- CrowdAnalyzer: Density and crowd statistics

Copyright 2024 Hirzexa Project
"""

__version__ = "2.0.0"
__phase__ = "Phase 2 - Analysis"

from hirzexa.analysis.analysis_types import (
    BehaviorType,
    PositionRecord,
    MotionState,
    BehaviorFlags,
    TrackAnalysis,
    DensityCell,
    CrowdMetrics,
    FrameAnalysis
)
from hirzexa.analysis.track_history import (
    TrackHistory,
    TrackHistoryManager
)
from hirzexa.analysis.motion_analyzer import (
    MotionAnalyzer,
    MotionAnalyzerConfig
)
from hirzexa.analysis.behavior_analyzer import (
    BehaviorAnalyzer,
    BehaviorAnalyzerConfig
)
from hirzexa.analysis.crowd_analyzer import (
    CrowdAnalyzer,
    CrowdAnalyzerConfig
)

__all__ = [
    # Types
    "BehaviorType",
    "PositionRecord",
    "MotionState",
    "BehaviorFlags",
    "TrackAnalysis",
    "DensityCell",
    "CrowdMetrics",
    "FrameAnalysis",
    # Track History
    "TrackHistory",
    "TrackHistoryManager",
    # Motion Analysis
    "MotionAnalyzer",
    "MotionAnalyzerConfig",
    # Behavior Analysis
    "BehaviorAnalyzer",
    "BehaviorAnalyzerConfig",
    # Crowd Analysis
    "CrowdAnalyzer",
    "CrowdAnalyzerConfig",
]
