type EventProperties = Record<string, unknown>

/** Safely capture browser actions from modules that may also render on the server. */
export function capturePosthog(event: string, properties?: EventProperties) {
  if (typeof window === "undefined") return

  void import("./posthog.client")
    .then(({ default: posthog }) => posthog.capture(event, properties))
    .catch(() => undefined)
}
