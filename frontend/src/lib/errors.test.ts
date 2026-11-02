import { describe, expect, it } from "vitest";

import { HirzexaClientError, getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("shows the backend's safe validation message", () => {
    const error = new HirzexaClientError(
      "Backend request failed with HTTP 400: A camera is already registered for this stream endpoint.",
      "UNKNOWN_API_ERROR",
      400,
    );

    expect(getErrorMessage(error)).toBe("A camera is already registered for this stream endpoint.");
  });
});
