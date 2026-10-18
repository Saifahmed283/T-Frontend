/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Terramorph API. Empty string means same-origin (dev proxy). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
