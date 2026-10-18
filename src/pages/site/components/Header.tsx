import { useEffect, useMemo, useRef, useState } from "react"
import { audiences } from "@/content/data"
import {
  columnMeta,
  pagesInColumn,
  pageSummary,
  type ColumnKey,
} from "@/content/pages"
import { columnMetaAr, localizedPage } from "@/content/pages.i18n"
import { Logo } from "@/components/motion/fx"
import { SearchOverlay } from "@/pages/site/home"
import type { Lang } from "../types"

const nav = [
  { id: "evidence", path: "/evidence", en: "Evidence", ar: "الأدلة" },
  { id: "cause", path: "/method", en: "Method", ar: "المنهج" },
  { id: "knowledge", path: "/knowledge", en: "Knowledge", ar: "المعرفة" },
  { id: "learning", path: "/learning", en: "Learning", ar: "التعلّم" },
  { id: "about", path: "/about", en: "About", ar: "من نحن" },
  { id: "join-board", path: "/join", en: "Join", ar: "انضم" },
]

/* Each primary nav item reveals its column's dedicated pages on hover/focus. */
const navColumn: Record<string, ColumnKey> = {
  evidence: "Evidence",
  cause: "Method",
  knowledge: "Knowledge",
  learning: "Learning",
  about: "About",
  "join-board": "Join",
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("")
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    )
    const t = setTimeout(
      () =>
        ids.forEach((id) => {
          const el = document.getElementById(id)
          if (el) io.observe(el)
        }),
      400,
    )
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [ids])
  return active
}

function LangSwitch({
  lang,
  setLang,
  dark,
}: {
  lang: Lang
  setLang: (l: Lang) => void
  dark?: boolean
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      className={`relative grid grid-cols-2 rounded-full border p-0.5 text-[0.72rem] ${
        dark ? "border-ivory/20" : "border-navy/20"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-gold-light transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          lang === "ar" ? "translate-x-full rtl:-translate-x-full" : ""
        } start-0.5`}
      />
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`relative z-10 min-w-12 px-3 py-1.5 transition-colors ${
            lang === l
              ? "text-navy"
              : dark
                ? "text-ivory/60 hover:text-ivory"
                : "text-slate hover:text-navy"
          }`}
        >
          {l === "en" ? "EN" : "AR"}
        </button>
      ))}
    </div>
  )
}

function Header({
  lang,
  setLang,
}: {
  lang: Lang
  setLang: (l: Lang) => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const active = useActiveSection(useMemo(() => nav.map((n) => n.id), []))
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const set = () =>
      document.documentElement.style.setProperty(
        "--tm-header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      )
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [])
  const ar = lang === "ar"
  return (
    <>
      {/* Constant-height header: nothing here animates layout on scroll, so there
          is no stutter. The audience rail stays visible; only the drop shadow and
          background finish fade in via opacity (compositor-friendly). */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-navy-3/85 text-ivory backdrop-blur-xl"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-4 md:px-10">
          <a href="/" className="shrink-0">
            <Logo tone="ivory" />
          </a>
          <nav
            className="mx-auto hidden items-center lg:flex"
            aria-label="Primary"
          >
            {nav.map((n) => {
              const on = active === n.id
              const column = navColumn[n.id]
              const pages = (column ? pagesInColumn(column) : []).map((p) =>
                localizedPage(p, lang),
              )
              return (
                <div key={n.id} className="group relative">
                  <a
                    href={n.path}
                    aria-current={on ? "true" : undefined}
                    aria-haspopup={pages.length > 0 || undefined}
                    className={`relative flex items-center gap-1.5 px-4 py-2 text-[0.8rem] tracking-[0.14em] uppercase transition-colors ${
                      on ? "text-ivory" : "text-ivory/60 hover:text-ivory"
                    } ${
                      ar
                        ? "font-sans tracking-normal text-[0.95rem] normal-case"
                        : ""
                    }`}
                  >
                    {ar ? n.ar : n.en}
                    {pages.length > 0 && (
                      <span
                        aria-hidden
                        className="text-[0.55rem] text-gold-light/60 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-gold-light"
                      >
                        ▾
                      </span>
                    )}
                    <span
                      className={`absolute inset-x-4 -bottom-0.5 h-px bg-gold-light transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
                        on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </a>
                  {pages.length > 0 && (
                    <div className="invisible absolute start-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 rtl:translate-x-1/2">
                      <div className="w-[min(620px,90vw)] translate-y-1 border border-ivory/10 bg-navy-3/95 shadow-[0_40px_90px_-30px_rgba(0,0,0,.85)] backdrop-blur-xl transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
                        <div className="flex items-start justify-between gap-6 border-b border-ivory/10 px-6 py-5">
                          <div>
                            <p className="eyebrow text-gold-light">
                              {ar ? n.ar : column}
                            </p>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ivory/55">
                              {ar
                                ? columnMetaAr[column]
                                : columnMeta[column].blurb}
                            </p>
                          </div>
                          <a
                            href={n.path}
                            className="shrink-0 border-b border-gold-light/40 pb-0.5 text-[0.78rem] whitespace-nowrap text-gold-light transition hover:border-gold-light"
                          >
                            {ar ? "القسم كاملًا" : "View section"}{" "}
                            <span
                              aria-hidden
                              className="inline-block rtl:rotate-180"
                            >
                              →
                            </span>
                          </a>
                        </div>
                        <ul className="grid gap-0.5 p-2 sm:grid-cols-2">
                          {pages.map((p) => (
                            <li key={p.slug}>
                              <a
                                href={p.path}
                                className="group/p flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-ivory/[0.06]"
                              >
                                <span className="flex items-center gap-2 text-[0.95rem] tracking-normal text-ivory/85 normal-case transition-colors group-hover/p:text-ivory">
                                  {p.label}
                                  <span
                                    aria-hidden
                                    className="text-gold-light opacity-0 transition-all duration-300 group-hover/p:translate-x-1 group-hover/p:opacity-100 rtl:rotate-180"
                                  >
                                    →
                                  </span>
                                </span>
                                <span className="line-clamp-2 text-xs leading-snug text-ivory/45">
                                  {pageSummary(p)}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="ms-auto flex items-center gap-3 lg:ms-0">
            <button
              onClick={() => setSearch(true)}
              aria-label={ar ? "بحث (Ctrl K)" : "Search (Ctrl K)"}
              className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-gold-light hover:text-ivory"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <LangSwitch lang={lang} setLang={setLang} dark />
            </div>
            <a
              href="/contact"
              className="hidden bg-gold-light px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.2em] text-navy uppercase transition hover:bg-ivory xl:block"
            >
              {ar ? "تواصل" : "Contact"}
            </a>
            <button
              className="grid h-9 w-9 place-items-center lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
            >
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-ivory transition duration-300 ${
                    open ? "top-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-px bg-ivory transition duration-300 ${
                    open ? "bottom-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
        {/* Audience rail — the second row that never collapses, so the header height stays fixed */}
        <div className="border-t border-ivory/10">
          <div className="no-scrollbar mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-5 md:px-10">
            <span className="eyebrow shrink-0 py-2.5 pe-3 text-gold-light">
              {ar ? "أنا…" : "I am"}
            </span>
            {audiences.map((a) => (
              <a
                key={a.slug}
                href={`/hub/${a.slug}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-[0.78rem] text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory"
              >
                {ar ? a.ar : a.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-navy-3 pt-24 text-ivory transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${
          open
            ? "[clip-path:inset(0)]"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto px-6 pb-10">
          {nav.map((n, i) => {
            const column = navColumn[n.id]
            const pages = (column ? pagesInColumn(column) : []).map((p) =>
              localizedPage(p, lang),
            )
            return (
              <div
                key={n.id}
                className="border-b border-ivory/10 py-4 transition-[transform,opacity] duration-700"
                style={{
                  transitionDelay: open ? `${150 + i * 50}ms` : "0ms",
                  transform: open ? "none" : "translateY(20px)",
                  opacity: open ? 1 : 0,
                }}
              >
                <a
                  href={n.path}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 font-display text-4xl"
                >
                  <span className="eyebrow text-gold-light">0{i + 1}</span>
                  {ar ? n.ar : n.en}
                </a>
                {pages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 ps-10">
                    {pages.map((p) => (
                      <a
                        key={p.slug}
                        href={p.path}
                        onClick={() => setOpen(false)}
                        className="text-sm text-ivory/65 transition hover:text-ivory"
                      >
                        {p.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="mt-8 flex flex-wrap gap-2">
            {audiences.map((a) => (
              <a
                key={a.slug}
                href={`/hub/${a.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-full border border-ivory/15 px-3 py-1.5 text-sm text-ivory/70"
              >
                {ar ? a.ar : a.label}
              </a>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-10">
            <LangSwitch lang={lang} setLang={setLang} dark />
            <a
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-gold-light px-5 py-3 text-xs tracking-[0.2em] text-navy uppercase"
            >
              {ar ? "تواصل" : "Contact"}
            </a>
          </div>
        </nav>
      </div>
      {search && <SearchOverlay onClose={() => setSearch(false)} lang={lang} />}
    </>
  )
}

export { Header }
