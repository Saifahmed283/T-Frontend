import { Badge, Figure } from "@/components/ui"

import { Contours, Reveal, SplitText, Spotlight } from "@/components/motion/fx"

import type { Block as BlockDef, Tone } from "@/content/pages"

import type { Lang } from "@/pages/site/types"

/* Renders a single content block from the page registry. Each block is its own
   <section> with a shared rhythm so pages composed of different blocks still
   read as one document. */

const wrap = "border-b border-line py-16"

const h2 = "max-w-3xl text-h3 font-medium"

function initials(name: string) {
  return name

    .replace(/^(Dr\.|Prof\.)\s+/, "")

    .split(/\s+/)

    .slice(0, 2)

    .map((w) => w[0]?.toUpperCase() ?? "")

    .join("")
}

function BlockHead({
  heading,

  aside,
}: {
  heading?: string

  aside?: string
}) {
  if (!heading) return null

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <h2 className={h2}>
        <SplitText text={heading} />
      </h2>
      {aside && <p className="max-w-xs text-sm text-slate">{aside}</p>}
    </div>
  )
}

export function Block({
  block,

  index,

  lang = "en",
}: {
  block: BlockDef

  index: number

  lang?: Lang
}) {
  const d = index * 50

  const open = lang === "ar" ? "افتح ←" : "Open →"

  switch (block.kind) {
    case "prose":
      return (
        <section className={wrap}>
          <Reveal delay={d}>
            <BlockHead heading={block.heading} />
            <div
              className={`max-w-3xl space-y-5 text-lg leading-relaxed text-navy-2 ${
                block.heading ? "mt-8" : ""
              }`}
            >
              {block.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </section>
      )

    case "stats":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <div
            className={`grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4 ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it, i) => (
              <Reveal
                key={it.label}
                delay={d + i * 60}
                className="bg-ivory p-8"
              >
                <p className="font-display text-4xl leading-none text-gold-strong lg:text-5xl">
                  {it.value}
                </p>
                <p className="mt-4 text-sm font-medium text-navy">{it.label}</p>
                {it.note && (
                  <p className="mt-1 text-xs text-slate">{it.note}</p>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )

    case "table":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <div
            className={`overflow-x-auto border border-line ${
              block.heading ? "mt-10" : ""
            }`}
          >
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="eyebrow bg-ivory-2 text-slate">
                  {block.columns.map((h) => (
                    <th key={h} className="px-5 py-3.5 text-start font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-line transition hover:bg-ivory-2"
                  >
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className={`px-5 py-4 align-top ${
                          j === 0
                            ? "font-display text-lg text-gold-strong"
                            : "text-navy-2"
                        }`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.note && (
            <p className="mt-3 text-xs leading-relaxed text-slate">
              {block.note}
            </p>
          )}
        </section>
      )

    case "cards":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <div
            className={`grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3 ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it, i) => {
              const inner = (
                <Spotlight className="h-full" color="rgba(19,43,69,0.06)">
                  <article className="flex h-full flex-col p-8">
                    {it.kicker && (
                      <p className="eyebrow text-gold-strong">{it.kicker}</p>
                    )}
                    <h3 className="mt-3 text-2xl leading-snug font-medium">
                      {it.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate">
                      {it.body}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      {it.meta ? (
                        <span className="eyebrow text-slate">{it.meta}</span>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-3">
                        {it.badge && <Badge tone="gold">{it.badge}</Badge>}
                        {it.href && (
                          <span
                            aria-hidden
                            className="eyebrow text-gold-strong opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            {open}
                          </span>
                        )}
                      </span>
                    </div>
                  </article>
                </Spotlight>
              )

              return (
                <Reveal key={it.title} delay={d + i * 60} className="bg-ivory">
                  {it.href ? (
                    <a
                      href={it.href}
                      className="block h-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-navy"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </Reveal>
              )
            })}
          </div>
        </section>
      )

    case "list":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <ul
            className={`divide-y divide-line border-y border-line ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it, i) => {
              const row =
                "grid items-center gap-3 py-6 transition-colors hover:bg-ivory-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-navy md:grid-cases md:px-4"

              const inner = (
                <>
                  <div>
                    <p className="font-display text-2xl leading-snug font-medium">
                      {it.title}
                    </p>
                    {it.body && (
                      <p className="mt-1 text-sm text-slate">{it.body}</p>
                    )}
                  </div>
                  <p className="text-sm text-slate">{it.meta}</p>
                  <div className="flex items-center gap-3 md:justify-end">
                    {it.tag && <Badge tone="neutral">{it.tag}</Badge>}
                    {it.href && (
                      <span
                        aria-hidden
                        className="eyebrow text-gold-strong opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        {open}
                      </span>
                    )}
                  </div>
                </>
              )

              return (
                <Reveal as="li" key={it.title} delay={d + i * 40}>
                  {it.href ? (
                    <a href={it.href} className={`group ${row}`}>
                      {inner}
                    </a>
                  ) : (
                    <div className={row}>{inner}</div>
                  )}
                </Reveal>
              )
            })}
          </ul>
        </section>
      )

    case "timeline":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <ol
            className={`grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4 ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it, i) => (
              <Reveal
                as="li"
                key={it.step}
                delay={d + i * 60}
                className="flex flex-col bg-ivory p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-3xl leading-none text-gold-strong">
                    {it.step}
                  </span>
                  {it.meta && (
                    <span className="eyebrow text-slate">{it.meta}</span>
                  )}
                </div>
                <p className="mt-5 font-display text-xl font-medium">
                  {it.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {it.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </section>
      )

    case "faq":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <div
            className={`divide-y divide-line border-y border-line ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it) => (
              <details key={it.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium marker:hidden">
                  <span>{it.q}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-navy transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-slate">
                  {it.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )

    case "team":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <ul
            className={`grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.people.map((p, i) => (
              <Reveal
                as="li"
                key={p.name}
                delay={d + i * 50}
                className="flex items-start gap-5 bg-ivory p-7"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold font-display text-xl text-gold-strong">
                  {initials(p.name)}
                </span>
                <div>
                  <p className="font-display text-xl leading-snug font-medium">
                    {p.name}
                  </p>
                  <p className="eyebrow mt-1 text-gold-strong">{p.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {p.focus}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      )

    case "calendar":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <ul
            className={`border-t border-line ${block.heading ? "mt-10" : ""}`}
          >
            {block.items.map((it, i) => (
              <Reveal
                as="li"
                key={it.title}
                delay={d + i * 50}
                className="grid items-center gap-4 border-b border-line py-6 transition-colors hover:bg-ivory-2 md:grid-record md:px-4"
              >
                <div className="flex items-baseline gap-2 md:block">
                  <span className="font-display text-4xl leading-none">
                    {it.date}
                  </span>
                  <span className="eyebrow text-gold-strong md:mt-1 md:block">
                    {it.month}
                  </span>
                </div>
                <p className="font-display text-xl font-medium">{it.title}</p>
                <p className="text-sm text-slate">{it.format}</p>
                <div className="md:text-end">
                  <Badge tone={(it.tone ?? "neutral") as Tone}>
                    {it.status}
                  </Badge>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>
      )

    case "links":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} aside={block.aside} />
          <ul
            className={`divide-y divide-line border-y border-line ${
              block.heading ? "mt-10" : ""
            }`}
          >
            {block.items.map((it) => (
              <li key={it.label}>
                <a
                  href={it.href}
                  className="group grid items-center gap-2 py-5 transition-colors hover:bg-ivory-2 md:grid-feature md:px-4"
                >
                  <span className="min-w-0 break-words font-display text-xl transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                    {it.label}
                  </span>
                  <span className="text-sm text-slate">{it.meta}</span>
                  <span className="md:text-end">
                    {it.badge ? (
                      <Badge tone="gold">{it.badge}</Badge>
                    ) : (
                      <span className="eyebrow text-gold-strong">
                        {lang === "ar" ? "افتح ↗" : "Open ↗"}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )

    case "figure":
      return (
        <section className={wrap}>
          <BlockHead heading={block.heading} />
          <Reveal delay={d} className={block.heading ? "mt-10" : ""}>
            <Figure
              src={block.src}
              alt={block.alt}
              eyebrow={block.eyebrow}
              title={block.title}
              caption={block.caption}
              credit={block.credit}
              ratio={block.ratio}
              ink={block.ink}
            />
          </Reveal>
        </section>
      )

    case "quote":
      return (
        <section className={wrap}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span
              aria-hidden
              className="font-display text-6xl leading-none text-gold"
            >
              “
            </span>
            <blockquote className="mt-2 font-display text-3xl leading-snug italic text-navy-2">
              {block.text}
            </blockquote>
            <p className="eyebrow mt-6 text-gold-strong">{block.attribution}</p>
          </Reveal>
        </section>
      )

    case "cta":
      return (
        <section className="py-16">
          <Reveal className="relative overflow-hidden bg-navy p-10 text-ivory md:p-14">
            <Contours
              className="absolute inset-0 h-full w-full"
              opacity={0.08}
            />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl leading-tight font-medium">
                {block.title}
              </h2>
              <p className="mt-4 leading-relaxed text-ivory/70">{block.body}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                {block.actions.map((a) =>
                  a.primary ? (
                    <a
                      key={a.label}
                      href={a.href}
                      className="bg-gold-light px-6 py-3.5 text-xs tracking-cta text-navy uppercase transition hover:bg-ivory"
                    >
                      {a.label}
                    </a>
                  ) : (
                    <a
                      key={a.label}
                      href={a.href}
                      className="border border-ivory/25 px-6 py-3.5 text-xs tracking-cta uppercase transition hover:border-gold-light"
                    >
                      {a.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )

    default:
      return null
  }
}
