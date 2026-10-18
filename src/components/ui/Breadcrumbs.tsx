export function Breadcrumbs({
  items,
}: {
  items: {
    label: string
    href?: string
  }[]
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-slate">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-2">
              {it.href && !last ? (
                <a
                  href={it.href}
                  className="transition hover:text-navy hover:underline decoration-gold underline-offset-4"
                >
                  {it.label}
                </a>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-navy" : undefined}
                >
                  {it.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="text-line">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
