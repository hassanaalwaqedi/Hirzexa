"use client";

import { useEffect, useMemo, useState } from "react";
import { HirzexaWebSocketClient } from "@/lib/websocket-client";
import type { WebSocketConnectionState, WebSocketMessage } from "@/types";

export function useHirzexaWebSocket(enabled = true) {
  const [state, setState] = useState<WebSocketConnectionState>("idle");
  const [message, setMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () =>
      new HirzexaWebSocketClient({
        onMessage: setMessage,
        onStateChange: setState,
        onError: setError
      }),
    []
  );

  useEffect(() => {
    if (!enabled) return undefined;

    client.connect();
    return () => client.close();
  }, [client, enabled]);

  return {
    state,
    message,
    error
  };
}
