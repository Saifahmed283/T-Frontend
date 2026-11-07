/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Terramorph API. Empty string means same-origin (dev proxy). */
  readonly VITE_API_URL?: string
  /** Public PostHog project token. */
  readonly VITE_POSTHOG_KEY?: string
  /** PostHog ingestion host. */
  readonly VITE_POSTHOG_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
