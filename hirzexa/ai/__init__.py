"""
Hirzexa - AI Module

AI Security Copilot powered by Gemini 2.5 Flash.

Architecture:
    Frontend → FastAPI AI Orchestrator → Collect Context → Gemini → Structured Response → Frontend

Gemini never talks directly to the frontend or queries the database.
"""

from hirzexa.ai.gemini_client import GeminiClient, get_gemini_client
from hirzexa.ai.orchestrator import AIOrchestrator, get_orchestrator
from hirzexa.ai.schemas import ChatRequest, ChatResponse, Intent

__all__ = [
    "GeminiClient",
    "get_gemini_client",
    "AIOrchestrator",
    "get_orchestrator",
    "ChatRequest",
    "ChatResponse",
    "Intent",
]
