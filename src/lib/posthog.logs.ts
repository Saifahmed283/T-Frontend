type LogAttributes = Record<string, string | number | boolean>

/** Sends only purpose-written browser log records to PostHog. */
export function logPosthogInfo(message: string, attributes?: LogAttributes) {
  if (typeof window === "undefined") return

  void import("./posthog.client")
    .then(({ default: posthog }) => posthog.logger.info(message, attributes))
    .catch(() => undefined)
}
