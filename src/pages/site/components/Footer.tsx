import { footer, footerAr, footerHeadingAr } from "@/content/data"
import { labelPath } from "@/content/pages"
import { useCookieConsent } from "@/components/ui/CookieBanner"
import { usePublicSettings } from "@/lib/publicContent"

import { GoldLine, Logo } from "@/components/motion/fx"
import { Cookie } from "lucide-react"

import type { Lang } from "../types"

const COLUMN_FALLBACK: Record<string, string> = {
  Evidence: "/evidence",
  Method: "/method",
  Knowledge: "/knowledge",
  Learning: "/learning",
  About: "/about",
  Join: "/join",
}

const legalLinks = [
  { slug: "privacy-policy", label: { en: "Privacy Policy", ar: "سياسة الخصوصية" } },
  { slug: "terms-of-service", label: { en: "Terms of Service", ar: "شروط الخدمة" } },
  { slug: "cookie-policy", label: { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" } },
] as const

function setting(obj: Record<string, unknown> | null | undefined, key: string): string {
  const value = obj?.[key]
  return typeof value === "string" && value.trim() ? value : ""
}

function Footer({ lang }: { lang: Lang }) {
  const ar = lang === "ar"
  const { openPreferences } = useCookieConsent()
  const { settings, live } = usePublicSettings()

  const contact = live && settings ? settings.contact as Record<string, unknown> : {}
  const legal = live && settings ? settings.legal as Record<string, unknown> : {}
  const social = live && settings ? settings.social as Record<string, unknown> : {}

  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-5 sm:pt-16 sm:pb-10 md:px-10 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <Logo />
          <p className="max-w-sm font-display text-lg italic text-navy-2 sm:text-xl">
            {ar
              ? "نُعيد تشكيل الأرض التي تقوم عليها الاقتصادات."
              : "Reshaping the ground on which economies stand."}
          </p>
        </div>
        <GoldLine className="mt-6 sm:mt-10" />
        <div className="mt-8 grid grid-cols-2 gap-6 sm:gap-8 sm:mt-10 md:grid-cols-3 lg:grid-cols-6 lg:gap-10">
          {Object.entries(footer).map(([h, ls]) => (
            <div key={h}>
              <p className="eyebrow text-gold-strong">
                {ar ? footerHeadingAr[h] : h}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-2 sm:mt-5 sm:space-y-2.5">
                {ls.map((l, i) => (
                  <li key={l}>
                    <a
                      href={labelPath[l] ?? COLUMN_FALLBACK[h] ?? "/"}
                      className="hover:text-navy hover:underline decoration-gold underline-offset-4 inline-block py-0.5"
                    >
                      {ar ? (footerAr[h]?.[i] ?? l) : l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal identity row */}
        <div className="mt-10 grid gap-4 border-t border-line pt-6 text-xs text-slate sm:mt-12 sm:gap-6 sm:pt-8 md:mt-16 md:grid-cols-4">
          {[
            ["Legal identity", setting(legal, "companyName") || "TerraMorph Advisory LLC"],
            ["Commercial reg.", setting(legal, "registrationNumber") || "CR No. 184 562 · Cairo"],
            ["Tax ID", setting(legal, "vatNumber") || "TIN 742-118-903"],
            ["Registered address", setting(contact, "address") || "New Cairo, Egypt"],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="eyebrow text-navy">{l}</p>
              <p className="mt-1.5 sm:mt-2">{v}</p>
            </div>
          ))}
        </div>

        {/* Bottom bar: copyright + legal links inline */}
        <div className="mt-12 pt-8 border-t border-line">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:justify-between">
            <p className="eyebrow text-slate">
              {ar ? "© 2026 شركة تيرامورف. جميع الحقوق محفوظة." : "© 2026 TerraMorph. All rights reserved."}
            </p>
            <div className="flex items-center gap-3 sm:gap-6 text-sm text-slate">
              <a
                href={setting(legal, "privacyPolicyUrl") || "/legal/privacy-policy"}
                className="underline decoration-gold underline-offset-2 hover:text-navy"
              >
                {ar ? "سياسة الخصوصية" : "Privacy Policy"}
              </a>
              <span className="text-gold-strong">/</span>
              <a
                href={setting(legal, "termsOfServiceUrl") || "/legal/terms-of-service"}
                className="underline decoration-gold underline-offset-2 hover:text-navy"
              >
                {ar ? "شروط الخدمة" : "Terms of Service"}
              </a>
              <span className="text-gold-strong">/</span>
              <button
                type="button"
                onClick={openPreferences}
                className="underline decoration-gold underline-offset-2 hover:text-navy"
                aria-label={ar ? "تفضيلات ملفات تعريف الارتباط" : "Cookie preferences"}
              >
                {ar ? "تفضيلات ملفات تعريف الارتباط" : "Cookie preferences"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
