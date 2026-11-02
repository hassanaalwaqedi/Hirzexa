import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HirzexaCoreVisualization } from "./hirzexa-core-visualization";
import type { OperatorRuntime } from "@/lib/operator-runtime";

afterEach(cleanup);

const runtime = (state: OperatorRuntime["state"], speakingLevel = 0): OperatorRuntime => ({
  state,
  activeGesture: state === "SPEAKING" ? "speak-neutral" : "idle",
  intent: "answer",
  projectionAnchor: "centerProjectionAnchor",
  attentionTarget: "forward",
  listeningLevel: 0,
  speakingLevel,
  target: null,
});

describe("Hirzexa core speech animation inputs", () => {
  it("keeps visible core movement active for quiet speech and varies it with playback level", () => {
    const { container, rerender } = render(
      <HirzexaCoreVisualization runtime={runtime("SPEAKING")} status="live" statusLabel="Live" stateLabel="Speaking" />,
    );
    const core = container.querySelector<HTMLElement>(".hirzexa-core-viz");
    expect(core?.dataset.state).toBe("SPEAKING");
    expect(Number(core?.style.getPropertyValue("--voice-level"))).toBeGreaterThan(0);
    expect(core?.style.getPropertyValue("--core-speaking-scale")).toBe("1.0549");
    expect(container.querySelectorAll(".hirzexa-core-viz-voice-ring i")).toHaveLength(32);

    rerender(
      <HirzexaCoreVisualization runtime={runtime("SPEAKING", 0.8)} status="live" statusLabel="Live" stateLabel="Speaking" />,
    );
    expect(core?.style.getPropertyValue("--core-speaking-scale")).toBe("1.089");
  });

  it("does not label idle playback as speaking", () => {
    const { container } = render(
      <HirzexaCoreVisualization runtime={runtime("IDLE", 0.8)} status="live" statusLabel="Live" stateLabel="Ready" />,
    );
    const core = container.querySelector<HTMLElement>(".hirzexa-core-viz");
    expect(core?.dataset.state).toBe("IDLE");
    expect(core?.style.getPropertyValue("--voice-level")).toBe("0");
  });
});
