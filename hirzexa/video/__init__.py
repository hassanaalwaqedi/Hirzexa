"""
Hirzexa Video Module

Provides video input/output handling for files and camera streams.
"""

from hirzexa.video.source import VideoSource
from hirzexa.video.writer import VideoWriter
from hirzexa.video.rtsp_source import RTSPSource, CameraHealth, CameraStats
from hirzexa.video.camera_manager import CameraManager, CameraConfig, CameraEvent

__all__ = [
    "VideoSource",
    "VideoWriter",
    "RTSPSource",
    "CameraHealth",
    "CameraStats",
    "CameraManager",
    "CameraConfig",
    "CameraEvent",
]
