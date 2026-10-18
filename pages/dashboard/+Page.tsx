import { lazy, Suspense } from "react"

const Workspace = lazy(() => import("@/pages/dashboard/Workspace"))

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <Workspace />
    </Suspense>
  )
}
