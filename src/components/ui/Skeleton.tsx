import type { CSSProperties, ReactNode } from "react"

/* Skeleton placeholders.
 *
 * They mirror the shape of the content that is about to appear, so the layout
 * does not jump when data lands. Everything is aria-hidden and the container
 * carries role="status" + a visually hidden label, so screen-reader users hear
 * "Loading" once instead of a pile of empty boxes.
 */

export function Skeleton({
  className = "",
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-ivory-2 ${className}`}
      style={style}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number
  className?: string
}) {
  return (
    <div aria-hidden className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-3 animate-pulse rounded bg-ivory-2 ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0"
        >
          <div className="h-3.5 w-48 animate-pulse rounded bg-ivory-2" />
          <div className="ms-auto h-4 w-16 animate-pulse rounded bg-ivory-2" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl border border-line bg-surface ${className}`}
    >
      <div className="h-40 rounded-t-xl bg-ivory-2" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-2/3 rounded bg-ivory-2" />
        <div className="h-3 w-1/2 rounded bg-ivory-2" />
      </div>
    </div>
  )
}

export function SkeletonRegion({
  label = "Loading",
  children,
  className = "",
}: {
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <SkeletonRegion label="Loading workspace" className="tm-workspace">
      <div className="min-h-screen bg-ivory">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-6 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden space-y-4 lg:block">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </aside>
          <main className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-64" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-36 w-full rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Skeleton className="h-72 rounded-xl lg:col-span-2" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    </SkeletonRegion>
  )
}
