import { useEffect, useMemo, useRef, useState } from "react"

import { usePageContext } from "vike-react/usePageContext"

import { audiences } from "@/content/data"

import {
  columnMeta,
  pagesInColumn,
  pageSummary,
  type ColumnKey,
} from "@/content/pages"

import { columnMetaAr, localizedPage, loadPagesAr } from "@/content/pages.i18n"

import { loadHubsAr } from "@/content/hubs.i18n"

import { Logo } from "@/components/motion/fx"

import { SearchOverlay } from "@/pages/site/home"

import { usePublicSettings } from "@/lib/publicContent"

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

/* Routes that render the full Site shell with all sections stacked. On these
   pages, nav links use hash anchors so the browser scrolls directly to the
   section instead of doing a full page reload (which would flash the hero
   first, then scroll down). Everywhere else (detail pages, hubs, dashboard),
   nav links use the full route path. */

const sectionRoutes = new Set([
  "/",

  "/for",

  "/evidence",

  "/method",

  "/knowledge",

  "/learning",

  "/about",

  "/join",

  "/contact",
])

function isSectionRoute(pathname: string): boolean {
  return sectionRoutes.has(pathname.replace(/\/+$/, "") || "/")
}

function setting(obj: Record<string, unknown> | null | undefined, key: string): string {
  const value = obj?.[key]
  return typeof value === "string" && value.trim() ? value : ""
}

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

/* Best-effort warm-up of the Arabic copy chunks when the visitor shows intent
   (hover/focus the AR button). Fire-and-forget: failures are swallowed because
   the toggle path re-requests and surfaces the result properly. */

function prefetchArabic() {
  void loadPagesAr().catch(() => {})

  void loadHubsAr().catch(() => {})
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
      className={`relative grid shrink-0 grid-cols-2 rounded-full border p-0.5 text-label ${
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
          /* Warm the Arabic chunks on intent so the toggle lands on translated
             content immediately instead of waiting on the network. */

          onPointerEnter={l === "ar" ? prefetchArabic : undefined}
          onFocus={l === "ar" ? prefetchArabic : undefined}
          aria-pressed={lang === l}
          className={`relative z-10 inline-flex min-h-6 w-full items-center justify-center px-3 py-1.5 transition-colors ${
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
  const { urlPathname } = usePageContext()
  const { settings, live } = usePublicSettings()

  const contact = live && settings ? (settings.contact as Record<string, unknown>) : {}
  const contactEmail = setting(contact, "email")

  const onSectionRoute = isSectionRoute(urlPathname)

  const navHref = (n: { id: string; path: string }): string =>
    onSectionRoute ? `#${n.id}` : n.path

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
    let last = scrolled

    const on = () => {
      const next = window.scrollY > 60

      if (next === last) return

      last = next

      setScrolled(next)
    }

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
          background finish fade in via opacity (compositor-friendly).
          No backdrop-blur: the sticky header sits above every scroll frame, so a
          full-width backdrop-filter forces a re-blur of the whole viewport on each
          scroll — the single most expensive thing a low-end GPU can be asked to do.
          A near-opaque navy ground reads the same and costs nothing to composite.

          Keep backdrop-filter off this element: any backdrop-filter here makes the
          header a backdrop root, so the dropdown panels nested inside it have nothing
          to blur and render as flat see-through rectangles. The blur belongs on the
          panel (see the dropdown below), not on the bar. */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-navy-3 text-ivory"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 shadow-drop transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="mx-auto flex max-w-[1320px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 md:gap-6 md:px-10">
          <a href="/" className="shrink-0">
            <Logo tone="ivory" wordmark="always" className="h-8 w-auto sm:h-10" />
          </a>
          <nav
            className="mx-auto hidden items-center xl:flex"
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
                    href={navHref(n)}
                    aria-current={on ? "true" : undefined}
                    aria-haspopup={pages.length > 0 || undefined}
                    className={`relative flex items-center gap-1.5 px-4 py-2 text-label tracking-cta uppercase transition-colors ${
                      on ? "text-ivory" : "text-ivory/60 hover:text-ivory"
                    } ${
                      ar ? "font-sans tracking-normal text-sm normal-case" : ""
                    }`}
                  >
                    {ar ? n.ar : n.en}
                    {pages.length > 0 && (
                      <span
                        aria-hidden
                        className="text-micro text-gold-light/60 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-gold-light"
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
                    <div className="invisible absolute start-1/2 top-full z-50 -translate-x-1/2 pt-3 group-hover:visible group-focus-within:visible rtl:translate-x-1/2">
                      <div className="relative w-[min(620px,90vw)] translate-y-1 overflow-hidden border border-ivory/10 shadow-overlay transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
                        {/* The frosted ground is its own layer, sibling to the fading
                            content: backdrop-filter is skipped while an element (or
                            its ancestor) animates opacity, so fading the panel itself
                            made the blur pop in only after the 300ms fade. */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-navy-3 supports-[backdrop-filter:blur(1px)]:bg-navy-3/75 backdrop-blur-xl"
                        />
                        <div className="relative opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
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
                              href={navHref(n)}
                              className="shrink-0 border-b border-gold-light/40 pb-0.5 text-label whitespace-nowrap text-gold-light transition hover:border-gold-light"
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
                                  <span className="flex items-center gap-2 text-sm tracking-normal text-ivory/85 normal-case transition-colors group-hover/p:text-ivory">
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
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ms-0 xl:gap-3">
            <button
              onClick={() => setSearch(true)}
              aria-label={ar ? "بحث (Ctrl K)" : "Search (Ctrl K)"}
              className="grid h-9 w-9 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-gold-light hover:text-ivory"
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
            <div className="hidden shrink-0 sm:block">
              <LangSwitch lang={lang} setLang={setLang} dark />
            </div>
            <a
              href={contactEmail ? `mailto:${contactEmail}` : "/contact"}
              className="hidden bg-gold-light px-5 py-2.5 text-label font-medium tracking-cta text-navy uppercase transition hover:bg-ivory min-[1320px]:block"
            >
              {ar ? "تواصل" : "Contact"}
            </a>
            <button
              className="grid h-9 w-9 min-h-[44px] min-w-[44px] place-items-center xl:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? (ar ? "إغلاق القائمة" : "Close menu") : ar ? "فتح القائمة" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
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
          <div className="no-scrollbar mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-3 py-1 sm:px-5 md:px-10">
            <span className="eyebrow shrink-0 py-2 pe-2 text-gold-light sm:py-2.5 sm:pe-3">
              {ar ? "أنا…" : "I am"}
            </span>
            {audiences.map((a) => (
              <a
                key={a.slug}
                href={`/hub/${a.slug}`}
                className="shrink-0 rounded-full px-2.5 py-1 text-label text-ivory/60 transition hover:bg-ivory/10 hover:text-ivory min-h-[36px] flex items-center sm:px-3 sm:py-1.5"
              >
                {ar ? a.ar : a.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-40 bg-navy-3 pt-24 text-ivory transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] xl:hidden ${
          open ? "reveal-open" : "pointer-events-none reveal-closed"
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
                  href={navHref(n)}
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
              href={contactEmail ? `mailto:${contactEmail}` : "/contact"}
              onClick={() => setOpen(false)}
              className="bg-gold-light px-5 py-3 text-xs tracking-cta text-navy uppercase"
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
