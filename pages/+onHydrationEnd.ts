export { onHydrationEnd }

async function onHydrationEnd() {
  await import("@/lib/posthog.client")
}
