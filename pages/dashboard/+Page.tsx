import { lazy, Suspense, useEffect } from "react"
import { ensureArabicFonts } from "@/lib/fonts"

const Workspace = lazy(() => import("@/pages/dashboard/Workspace"))

export default function Page() {
  /* The dashboard renders Arabic content fields, so load the Arabic families it
     used to inherit from the global <head> (now loaded on demand). */
  useEffect(() => {
    ensureArabicFonts()
  }, [])
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <Workspace />
    </Suspense>
  )
}
