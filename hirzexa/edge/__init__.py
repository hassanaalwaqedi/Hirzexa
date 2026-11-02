"""
Hirzexa - Edge Intelligence Module

Phase 1: Lightweight edge processing pipeline (CPU-only).
Runs YOLO detection, ByteTrack tracking, and proximity risk assessment.
Only escalates suspicious events to the cloud layer.

Components:
    - EdgePipeline: Main processing orchestrator
    - EdgeRiskFilter: Legacy rule-based risk filter
    - PipelineResult: Processing result container
"""

from hirzexa.edge.edge_pipeline import EdgePipeline
from hirzexa.edge.pipeline_types import PipelineResult
from hirzexa.edge.edge_risk_filter import EdgeRiskFilter
from hirzexa.edge.event_types import EdgeAssessment, SuspiciousEvent, TrackSummary

__all__ = [
    "EdgePipeline",
    "PipelineResult",
    "EdgeRiskFilter",
    "EdgeAssessment",
    "SuspiciousEvent",
    "TrackSummary",
]
