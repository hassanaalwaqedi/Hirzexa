"""
Hirzexa - Camera Module

Split from the original camera_sources.py (2,075 lines) into focused modules:
- types: Enums, dataclasses, type aliases
- base: BaseCameraSource ABC and OpenCV loop base
- sources: Concrete source implementations (Local, RTSP, HTTP, Browser, Upload)
- factory: CameraSourceFactory
- registry: CameraRegistry (persistent config storage)
- manager: MultiCameraPipelineManager, CameraHealthMonitor

The FrameIngestionService remains in hirzexa.video.camera_sources for now
(it needs a larger refactor into the pipeline/ package in a later phase).
"""

from hirzexa.camera.types import (
    CameraSourceType,
    CameraConnectionStatus,
    CameraConfig,
    CameraRuntimeStatus,
    FrameCallback,
    StatusCallback,
)
from hirzexa.camera.base import BaseCameraSource
from hirzexa.camera.sources import (
    OpenCVCameraSource,
    RTSPCameraSource,
    HTTPCameraSource,
    BrowserWebcamSource,
    UploadedVideoSource,
    UnavailableCameraSource,
)
from hirzexa.camera.factory import CameraSourceFactory
from hirzexa.camera.registry import CameraRegistry
from hirzexa.camera.manager import MultiCameraPipelineManager, CameraHealthMonitor
from hirzexa.camera.utils import (
    mask_url,
    safe_camera_id,
    decode_base64_frame,
    frame_to_data_url,
)

__all__ = [
    "CameraSourceType",
    "CameraConnectionStatus",
    "CameraConfig",
    "CameraRuntimeStatus",
    "FrameCallback",
    "StatusCallback",
    "BaseCameraSource",
    "OpenCVCameraSource",
    "RTSPCameraSource",
    "HTTPCameraSource",
    "BrowserWebcamSource",
    "UploadedVideoSource",
    "UnavailableCameraSource",
    "CameraSourceFactory",
    "CameraRegistry",
    "MultiCameraPipelineManager",
    "CameraHealthMonitor",
    "mask_url",
    "safe_camera_id",
    "decode_base64_frame",
    "frame_to_data_url",
]
