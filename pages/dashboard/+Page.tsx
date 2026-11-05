import { lazy, Suspense, useEffect } from "react"

import { ensureArabicFonts } from "@/lib/fonts"
import { useWorkspace } from "@/pages/dashboard/hooks/useWorkspace"

const Workspace = lazy(() => import("@/pages/dashboard/Workspace"))

/* Dashboard route at /dashboard.
   - The session probe runs here, once. Its result is handed to the shell, so
     the dashboard never fires a second round of requests just to render.
   - A confirmed 401 → redirect to /dashboard/login.
   - Any other failure (network, 429, 5xx) is NOT "signed out": show a retry
     state instead of throwing the user out of the workspace.
   Always render something so the page title and <Head> component work
   correctly — never return null. */
export default function Page() {
  const ws = useWorkspace()
  const { data, loading, error, needsAuth, reload } = ws

  /* The Arabic dashboard content fields load the Arabic font families on
     demand. */
  useEffect(() => {
    ensureArabicFonts()
  }, [])

  useEffect(() => {
    if (!loading && needsAuth) {
      window.location.replace("/dashboard/login?return=/dashboard")
    }
  }, [loading, needsAuth])

  if (loading || (!data && !error)) {
    return <div className="min-h-screen bg-ivory" />
  }

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f5f1e7",
          color: "#132b45",
          fontFamily: "Jost, system-ui, sans-serif",
        }}
      >
        <div
          role="alert"
          style={{
            width: "min(460px, 100%)",
            padding: "26px 24px",
            border: "1px solid #e6dfd0",
            borderInlineStart: "2px solid #c4a868",
            borderRadius: "13px",
            background: "#fffdf8",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7f5f22",
            }}
          >
            Workspace unavailable
          </p>
          <h1
            style={{
              margin: "10px 0 6px",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "28px",
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            We could not reach the workspace.
          </h1>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "#5d646a",
            }}
          >
            {error ?? "The content service did not respond."} Your session has
            not been cleared — try again.
          </p>
          <button
            type="button"
            onClick={() => void reload()}
            style={{
              minHeight: "38px",
              padding: "8px 16px",
              border: "1px solid #0f2537",
              borderRadius: "9px",
              background: "#0f2537",
              color: "#fbf8f1",
              fontSize: "12.5px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <Workspace ws={ws} />
    </Suspense>
  )
}
