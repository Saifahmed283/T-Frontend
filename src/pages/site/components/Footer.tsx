import { footer, footerAr, footerHeadingAr } from "@/content/data"
import { labelPath } from "@/content/pages"
import { GoldLine, Logo } from "@/components/motion/fx"
import type { Lang } from "../types"

/* Every footer link resolves to its own dedicated page (content/pages.ts). The
   column heading falls back to the matching homepage section anchor. */
const COLUMN_FALLBACK: Record<string, string> = {
  Evidence: "/evidence",
  Method: "/method",
  Knowledge: "/knowledge",
  Learning: "/learning",
  About: "/about",
  Join: "/join",
}

const legal = [
  ["Legal identity", "TerraMorph Advisory LLC"],
  ["Commercial reg.", "CR No. 184 562 · Cairo"],
  ["Tax ID", "TIN 742-118-903"],
  ["Registered address", "New Cairo, Egypt"],
]

const legalAr = [
  ["الكيان القانوني", "TerraMorph Advisory LLC"],
  ["السجل التجاري", "CR No. 184 562 · القاهرة"],
  ["الرقم الضريبي", "TIN 742-118-903"],
  ["المقر المسجّل", "القاهرة الجديدة، مصر"],
]

function Footer({ lang }: { lang: Lang }) {
  const ar = lang === "ar"
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-[1320px] px-5 pt-20 pb-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Logo />
          <p className="max-w-sm font-display text-xl italic text-navy-2">
            {ar
              ? "نُعيد تشكيل الأرض التي تقوم عليها الاقتصادات."
              : "Reshaping the ground on which economies stand."}
          </p>
        </div>
        <GoldLine className="mt-10" />
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(footer).map(([h, ls]) => (
            <div key={h}>
              <p className="eyebrow text-gold-strong">
                {ar ? footerHeadingAr[h] : h}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-navy-2">
                {ls.map((l, i) => (
                  <li key={l}>
                    <a
                      href={labelPath[l] ?? COLUMN_FALLBACK[h] ?? "/"}
                      className="hover:text-navy hover:underline decoration-gold underline-offset-4"
                    >
                      {ar ? (footerAr[h]?.[i] ?? l) : l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 border-t border-line pt-8 text-xs text-slate md:grid-cols-4">
          {(ar ? legalAr : legal).map(([l, v]) => (
            <div key={l}>
              <p className="eyebrow text-navy">{l}</p>
              <p className="mt-2">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="eyebrow text-slate">
            {ar
              ? "© 2026 TerraMorph · رافعة للخير"
              : "© 2026 TerraMorph · Leverage for good"}
          </p>
          <a
            href="/dashboard"
            className="eyebrow text-slate transition hover:text-navy"
          >
            {ar ? "بوابة العملاء ↗" : "Client portal ↗"}
          </a>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
