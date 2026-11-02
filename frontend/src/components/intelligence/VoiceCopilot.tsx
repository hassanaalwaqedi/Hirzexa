"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, Mic, Radio, ShieldCheck, Volume2 } from "lucide-react";

import { useGeminiLiveVoice } from "@/hooks/useGeminiLiveVoice";
import { fetchLiveCapabilities, type HirzexaVoiceSessionState, type LiveCapabilities, type LiveCitation, type SafeUICommand, type VoiceState } from "@/lib/live-voice";
import { type Availability } from "@/lib/intelligence-context";

type Subtitle = { speaker: "operator" | "hirzexa"; text: string; citations: LiveCitation[] } | null;

/** A tool response can cite the same durable event through multiple paths. */
export function uniqueCitations(citations: LiveCitation[]) {
  const seen = new Set<string>();
  return citations.filter((citation) => {
    if (seen.has(citation.evidenceId)) return false;
    seen.add(citation.evidenceId);
    return true;
  });
}

export function applySafeUiCommand(command: SafeUICommand) {
  if (command.kind === "close_operator_view") {
    window.dispatchEvent(new CustomEvent("hirzexa:close-operator-view"));
    return;
  }
  if (command.kind === "open_workspace") {
    const targets: Record<string, string> = { dashboard: "/dashboard", cameras: "/cameras", events: "/events", tracks: "/tracks", evidence: "/semantic", semantic: "/semantic", analytics: "/analytics", intelligence: "/intelligence" };
    const target = command.targetId ? targets[command.targetId] : undefined;
    if (target) window.location.assign(target);
    return;
  }
  if (command.kind === "focus_health") {
    document.getElementById("intelligence-health-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  if (command.kind === "open_incident") {
    if (!command.targetId) return;
    window.location.assign(`/events?incident=${encodeURIComponent(command.targetId)}`);
    return;
  }
  if (command.kind === "open_cameras") {
    window.location.assign(command.cameraId ? `/cameras?camera=${encodeURIComponent(command.cameraId)}&view=focus` : "/cameras");
    return;
  }
  if (command.kind === "show_track_evidence") {
    const params = new URLSearchParams();
    if (command.targetId) params.set("track", command.targetId);
    if (command.cameraId) params.set("camera", command.cameraId);
    window.location.assign(params.size ? `/tracks?${params.toString()}` : "/tracks");
    return;
  }
  if (command.kind === "show_risk_evidence") {
    window.location.assign(command.targetId ? `/events?event=${encodeURIComponent(command.targetId)}` : "/events");
    return;
  }
  window.location.assign("/semantic");
}

function sessionLabel(state: HirzexaVoiceSessionState, voiceAvailable: boolean) {
  if (state === "DISABLED" && voiceAvailable) return "Ready to listen";
  return {
    DISABLED: "Voice disabled",
    ACTIVATING: "Activating Hirzexa",
    STANDBY: "Voice standby",
    WAKE_DETECTED: "Hirzexa attentive",
    LISTENING: "Listening",
    END_OF_SPEECH: "Processing speech",
    THINKING: "Thinking",
    EXECUTING: "Executing",
    SPEAKING: "Hirzexa speaking",
    FOLLOW_UP_WINDOW: "Follow-up ready",
    MUTED: "Microphone muted",
    ERROR: "Voice needs attention",
  }[state];
}

function privacyLabel({
  enabled, sessionActive,
}: {
  enabled: boolean; sessionActive: boolean;
}) {
  if (!enabled) return "Voice is unavailable for this Hirzexa session.";
  if (sessionActive) return "Local VAD sends audio to Hirzexa only while you are speaking.";
  return "Hirzexa is monitoring the system. Select Talk to Hirzexa whenever you want to speak.";
}

export default function VoiceCopilot({
  contextAvailability,
  contextReason,
  onActivity,
  onUiCommand,
  onUserTurn,
  onToolActivity,
  onProjection,
  sceneContext,
  onCitation,
}: {
  contextAvailability: Availability;
  contextReason?: string | null;
  onActivity?: (activity: { state: VoiceState; sessionState: HirzexaVoiceSessionState; inputLevel: number; outputLevel: number; sessionActive: boolean; isCapturing: boolean }) => void;
  onUiCommand?: (command: SafeUICommand) => void;
  onUserTurn?: (message: string) => void;
  onToolActivity?: (activity: { tool: string; status: "calling" | "completed" | "failed" }) => void;
  onProjection?: (execution: import("@/lib/operator-api").OperatorExecution) => void;
  sceneContext?: string;
  onCitation?: (citation: LiveCitation) => void;
}) {
  const [capabilities, setCapabilities] = useState<LiveCapabilities | null>(null);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<Subtitle>(null);
  const subtitleTimer = useRef<number | null>(null);
  const pendingCitationsRef = useRef<LiveCitation[]>([]);
  const userTurnRef = useRef("");

  const flushUserTurn = useCallback(() => {
    if (!userTurnRef.current.trim()) return;
    onUserTurn?.(userTurnRef.current.trim());
    userTurnRef.current = "";
  }, [onUserTurn]);

  const onTranscript = useCallback((entry: { speaker: "operator" | "hirzexa"; text: string; isFinal: boolean }) => {
    if (!entry.isFinal) return;
    if (entry.speaker === "operator") userTurnRef.current += entry.text;
    if (subtitleTimer.current !== null) window.clearTimeout(subtitleTimer.current);
    const citations = entry.speaker === "hirzexa" ? pendingCitationsRef.current : [];
    setSubtitle({ speaker: entry.speaker, text: entry.text, citations });
    subtitleTimer.current = window.setTimeout(() => setSubtitle(null), 9_000);
    if (entry.speaker === "hirzexa") pendingCitationsRef.current = [];
  }, []);

  const voice = useGeminiLiveVoice({
    onTranscript,
    onCitations: (citations) => { pendingCitationsRef.current = uniqueCitations(citations); },
    onToolActivity,
    sceneContext,
    onProjection: (execution) => {
      flushUserTurn();
      onProjection?.(execution);
    },
    onTurnComplete: flushUserTurn,
    onUiCommand: (command) => {
      flushUserTurn();
      if (onUiCommand) onUiCommand(command);
      else applySafeUiCommand(command);
    },
  });

  useEffect(() => {
    onActivity?.({
      state: voice.state,
      sessionState: voice.voiceSessionState,
      inputLevel: voice.waveformLevel,
      outputLevel: voice.playbackLevel,
      sessionActive: voice.sessionActive,
      isCapturing: voice.isCapturing,
    });
  }, [onActivity, voice.isCapturing, voice.playbackLevel, voice.sessionActive, voice.state, voice.voiceSessionState, voice.waveformLevel]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchLiveCapabilities(controller.signal)
      .then((next) => {
        setCapabilities(next);
        setCapabilityError(null);
      })
      .catch(() => setCapabilityError("Voice assistance is temporarily unavailable."));
    return () => {
      controller.abort();
      if (subtitleTimer.current !== null) window.clearTimeout(subtitleTimer.current);
    };
  }, []);

  const enabled = capabilities?.availability === "live" && contextAvailability === "live";
  const unavailableReason = capabilityError ?? capabilities?.reason ?? contextReason ?? "Voice assistance is temporarily unavailable.";
  const startConversation = () => {
    if (voice.sessionActive) return;
    void voice.startListening();
  };
  const state = voice.voiceSessionState;
  const voiceReady = enabled && !voice.sessionActive;

  return <aside className="operator-voice-presence" data-voice-state={state} data-active={voice.sessionActive} aria-label="Hirzexa voice presence">
    <button type="button" className="operator-voice-presence-action" onClick={startConversation} disabled={!voiceReady} aria-label="Talk to Hirzexa" title={enabled ? "Start listening now with one click." : unavailableReason}>
      {voice.sessionActive ? <AudioLines aria-hidden /> : <Mic aria-hidden />}
      <span>{voice.sessionActive ? "Hirzexa is listening" : "Talk to Hirzexa"}</span>
    </button>
    <div className="operator-voice-presence-status" role="status" aria-live="polite">
      <Radio aria-hidden />
      <strong>{sessionLabel(state, enabled)}</strong>
      {voice.isUserSpeaking || voice.state === "speaking" ? <i className="operator-voice-live-level" style={{ "--voice-level": voice.state === "speaking" ? voice.playbackLevel : voice.waveformLevel } as React.CSSProperties} aria-hidden /> : null}
    </div>
    <p className="operator-voice-privacy"><ShieldCheck aria-hidden />{privacyLabel({ enabled, sessionActive: voice.sessionActive })}</p>
    {voice.error ? <p className="operator-voice-error" role="alert">{voice.error}</p> : null}
    {subtitle ? <div className="operator-voice-subtitle" data-speaker={subtitle.speaker} aria-live="polite"><span>{subtitle.speaker === "operator" ? "Operator" : "Hirzexa"}</span><p>{subtitle.text}</p>{uniqueCitations(subtitle.citations).map((citation) => <button key={citation.evidenceId} type="button" onClick={() => onCitation?.(citation)}>{citation.label}</button>)}</div> : null}
    {voice.state === "speaking" ? <Volume2 className="operator-voice-speaking-icon" aria-hidden /> : null}
  </aside>;
}
