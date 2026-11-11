"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Cookie, Shield, X } from "lucide-react"

import { Badge } from "./Badge"
import { Button } from "./Button"
import { Dialog } from "./Dialog"
import { useLang } from "@/pages/site/SitePage"

/* Cookie consent categories */
export type CookieCategory = "essential" | "analytics" | "marketing"

export interface CookieConsentState {
  essential: boolean // always true
  analytics: boolean
  marketing: boolean
  timestamp: string // ISO string of last update
  version: number // consent version for future migrations
}

const CONSENT_KEY = "cookie_consent"
const CONSENT_VERSION = 1

const DEFAULT_CONSENT: CookieConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: CONSENT_VERSION,
}

const NON_ESSENTIAL_PREFIXES = [
  "_ga",
  "_gid",
  "_gat",
  "plausible_",
  "_fbp",
  "_gcl_",
  "_clck",
  "_clsk",
]

interface CookieConsentContextValue {
  consent: CookieConsentState
  showBanner: boolean
  mounted: boolean
  acceptAll: () => void
  rejectAll: () => void
  toggleCategory: (category: CookieCategory) => void
  openPreferences: () => void
  closePreferences: () => void
  closeBanner: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider")
  return ctx
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const prefix = `${name}=`
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      try {
        return decodeURIComponent(trimmed.slice(prefix.length))
      } catch {
        return null
      }
    }
  }
  return null
}

function writeConsent(consent: CookieConsentState) {
  if (typeof window === "undefined") return
  const serialized = JSON.stringify(consent)
  try {
    localStorage.setItem(CONSENT_KEY, serialized)
  } catch {
    /* storage unavailable — the cookie below is the fallback */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${secure}`
}

function clearConsent() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* storage unavailable */
  }
  document.cookie = `${CONSENT_KEY}=; path=/; max-age=0; SameSite=Lax`
}

function readConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null
  try {
    let raw: string | null = null
    try {
      raw = localStorage.getItem(CONSENT_KEY)
    } catch {
      raw = null
    }
    // localStorage can be unavailable (private mode / cleared) while the
    // cookie written on a previous visit still exists.
    if (!raw) raw = readCookie(CONSENT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CookieConsentState> | null
    if (!parsed || typeof parsed !== "object") return null

    // A policy/version bump must ask again instead of silently keeping a
    // stale choice. Clearing the old record makes the banner reappear.
    if (parsed.version !== CONSENT_VERSION) {
      clearConsent()
      return null
    }

    return {
      essential: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      timestamp:
        typeof parsed.timestamp === "string" && parsed.timestamp
          ? parsed.timestamp
          : new Date().toISOString(),
      version: CONSENT_VERSION,
    }
  } catch {
    return null
  }
}

function deleteNonEssentialCookies() {
  if (typeof document === "undefined") return

  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name))

  for (const name of names) {
    if (!NON_ESSENTIAL_PREFIXES.some((prefix) => name.startsWith(prefix))) continue
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
    document.cookie = `${name}=; path=/; domain=.askterramorph.com; max-age=0; SameSite=Lax`
  }

  try {
    Object.keys(localStorage).forEach((key) => {
      if (NON_ESSENTIAL_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key)
      }
    })
  } catch {
    /* storage unavailable */
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_CONSENT)
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const consentRef = useRef(consent)

  useEffect(() => {
    consentRef.current = consent
  }, [consent])

  useEffect(() => {
    setMounted(true)
    const saved = readConsent()
    if (saved) {
      consentRef.current = saved
      setConsent(saved)
      setShowBanner(false)
      setHydrated(true)
      return
    }

    // First visit (or a version bump) — show the banner after a brief delay.
    const timer = setTimeout(() => setShowBanner(true), 1500)
    setHydrated(true)
    return () => clearTimeout(timer)
  }, [])

  // Keep third-party consent signals in sync with the stored choice.
  useEffect(() => {
    if (!hydrated) return
    if (consent.analytics) loadAnalytics()
    else unloadAnalytics()
  }, [hydrated, consent.analytics])

  useEffect(() => {
    if (!hydrated) return
    if (consent.marketing) loadMarketing()
    else unloadMarketing()
  }, [hydrated, consent.marketing])

  const updateConsent = useCallback((updates: Partial<CookieConsentState>) => {
    const next: CookieConsentState = {
      ...consentRef.current,
      ...updates,
      essential: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    }
    consentRef.current = next
    setConsent(next)
    writeConsent(next)
  }, [])

  const acceptAll = useCallback(() => {
    updateConsent({ analytics: true, marketing: true })
    setShowBanner(false)
    setShowPreferences(false)
  }, [updateConsent])

  const rejectAll = useCallback(() => {
    updateConsent({ analytics: false, marketing: false })
    deleteNonEssentialCookies()
    setShowBanner(false)
    setShowPreferences(false)
  }, [updateConsent])

  const toggleCategory = useCallback(
    (category: CookieCategory) => {
      if (category === "essential") return
      if (category === "analytics") {
        updateConsent({ analytics: !consentRef.current.analytics })
        return
      }
      updateConsent({ marketing: !consentRef.current.marketing })
    },
    [updateConsent],
  )

  const openPreferences = useCallback(() => {
    // Opening preferences must not resurrect the banner behind the modal.
    setShowPreferences(true)
  }, [])

  const closePreferences = useCallback(() => {
    setShowPreferences(false)
  }, [])

  const closeBanner = useCallback(() => {
    setShowBanner(false)
  }, [])

  const value: CookieConsentContextValue = {
    consent,
    showBanner: mounted && showBanner,
    mounted,
    acceptAll,
    rejectAll,
    toggleCategory,
    openPreferences,
    closePreferences,
    closeBanner,
  }

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {mounted && showBanner && (
        <CookieBannerUI
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onDismiss={rejectAll}
          onOpenPreferences={openPreferences}
        />
      )}
      <CookiePreferencesModal open={mounted && showPreferences} onClose={closePreferences} />
    </CookieConsentContext.Provider>
  )
}

/* Banner UI */
function CookieBannerUI({
  onAcceptAll,
  onRejectAll,
  onDismiss,
  onOpenPreferences,
}: {
  onAcceptAll: () => void
  onRejectAll: () => void
  onDismiss: () => void
  onOpenPreferences: () => void
}) {
  const { lang } = useLang()
  const ar = lang === "ar"

  return (
    <div
      data-testid="cookie-banner"
      className="animate-slide-up fixed inset-x-0 bottom-0 z-50 md:bottom-4 md:left-auto md:right-4 md:w-[420px]"
      role="dialog"
      aria-label={ar ? "الموافقة على ملفات تعريف الارتباط" : "Cookie consent"}
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="max-h-[100dvh] overflow-y-auto overscroll-contain rounded-t-xl border border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-xl md:max-h-[calc(100dvh-2rem)] md:rounded-xl">
        <div className="flex items-start justify-between gap-3 border-b border-line p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Cookie className="text-gold-strong" size={20} aria-hidden="true" />
            <div>
              <p id="cookie-banner-title" className="text-sm font-medium text-navy">
                {ar ? "نحترم خصوصيتك" : "We value your privacy"}
              </p>
              <p id="cookie-banner-desc" className="mt-0.5 text-xs text-navy-2">
                {ar
                  ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل زيارات الموقع. ملفات الارتباط الأساسية لا يمكن إيقافها."
                  : "We use cookies to improve your experience and analyse site traffic. Essential cookies cannot be disabled."}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-strong hover:text-navy"
            onClick={onDismiss}
            aria-label={ar ? "إغلاق الشريط (الأساسية فقط)" : "Dismiss banner (essential only)"}
          >
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-3 px-4 py-3 text-sm sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="text-gold-strong" size={16} aria-hidden="true" />
              <span className="font-medium text-navy">{ar ? "الأساسية" : "Essential"}</span>
              <Badge tone="neutral" className="text-xs">
                {ar ? "مفعّلة دائمًا" : "Always on"}
              </Badge>
            </div>
            <span className="text-xs text-slate-strong">
              {ar ? "الجلسة، الحماية، التفضيلات" : "Session, security, preferences"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-navy">{ar ? "إحصائيات الاستخدام" : "Analytics"}</span>
            <Button variant="secondary" size="sm" onClick={onOpenPreferences} className="min-h-[44px] min-w-[80px] sm:min-h-0">
              {ar ? "إدارة" : "Manage"}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-navy">{ar ? "التسويق" : "Marketing"}</span>
            <Button variant="secondary" size="sm" onClick={onOpenPreferences} className="min-h-[44px] min-w-[80px] sm:min-h-0">
              {ar ? "إدارة" : "Manage"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
          <Button
            variant="primary"
            size="sm"
            onClick={onAcceptAll}
            className="min-h-[44px] flex-1 sm:min-h-0 sm:flex-none"
          >
            {ar ? "قبول الكل" : "Accept all"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenPreferences}
            className="min-h-[44px] flex-1 sm:min-h-0 sm:flex-none"
          >
            {ar ? "إدارة التفضيلات" : "Manage preferences"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRejectAll}
            className="min-h-[44px] flex-1 sm:min-h-0 sm:flex-none"
          >
            {ar ? "رفض الكل" : "Reject all"}
          </Button>
        </div>

        <p className="border-t border-line px-4 pb-4 text-center text-xs text-slate-strong sm:px-5 sm:pb-5">
          <a
            href="/legal/cookie-policy"
            className="underline decoration-gold underline-offset-2 hover:text-navy"
          >
            {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
          </a>{" "}
          ·{" "}
          <a
            href="/legal/privacy-policy"
            className="underline decoration-gold underline-offset-2 hover:text-navy"
          >
            {ar ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
        </p>
      </div>
    </div>
  )
}

/* Preferences Modal */
function CookiePreferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const { consent, toggleCategory, acceptAll, rejectAll } = useCookieConsent()

  const categories = useMemo(
    () => [
      {
        key: "essential" as const,
        title: ar ? "ملفات تعريف الارتباط الأساسية" : "Essential Cookies",
        description: ar
          ? "ضرورية لعمل الموقع بشكل صحيح. لا يمكن إيقافها."
          : "Required for the website to function properly. Cannot be disabled.",
        icon: Shield,
        items: ar
          ? ["مصادقة الجلسة (tm_session)", "حماية CSRF", "تفضيلات ملفات تعريف الارتباط"]
          : ["Session authentication (tm_session)", "CSRF protection", "Cookie consent preferences"],
      },
      {
        key: "analytics" as const,
        title: ar ? "ملفات تعريف الإحصائيات" : "Analytics Cookies",
        description: ar
          ? "تساعدنا في فهم كيفية تفاعل الزوار مع موقعنا (مُعرّضات بشكل مستعار)."
          : "Help us understand how visitors interact with our site (pseudonymised).",
        icon: Cookie,
        items: ar
          ? ["مشاهدات الصفحات، المحيل، وقت البقاء", "عنوان IP مستعار (مُخفي)", "لا تحتوي على معرفات شخصية"]
          : ["Page views, referrer, dwell time", "Pseudonymised IP address", "No personal identifiers"],
      },
      {
        key: "marketing" as const,
        title: ar ? "ملفات تعريف التسويق" : "Marketing Cookies",
        description: ar
          ? "تُستخدم لتقديم إعلانات ذات صلة وقياس فعالية الحملات."
          : "Used to deliver relevant ads and measure campaign effectiveness.",
        icon: Cookie,
        items: ar
          ? ["تتبع التحويلات (ميتا، غوغل)", "جماهير الاستهداف", "فقط إذا كانت لدينا حملات إعلانية مدفوعة"]
          : ["Conversion tracking (Meta, Google)", "Retargeting audiences", "Only if we run paid campaigns"],
      },
    ],
    [ar],
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onBackdropClick={onClose}
      labelledBy="cookie-modal-title"
      className="flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div
        data-testid="cookie-preferences"
        className="animate-slide-up relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
          <h2 id="cookie-modal-title" className="font-medium text-navy">
            {ar ? "تفضيلات ملفات تعريف الارتباط" : "Cookie Preferences"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={onClose}
            aria-label={ar ? "إغلاق التفضيلات" : "Close preferences"}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="max-h-[60dvh] space-y-4 overflow-y-auto p-4 sm:p-5">
          {categories.map((cat) => (
            <div key={cat.key} className="rounded-lg border border-line p-4">
              <div className="flex items-start gap-3">
                <cat.icon className="mt-0.5 flex-shrink-0 text-gold-strong" size={20} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 id={`cookie-title-${cat.key}`} className="font-medium text-navy">
                      {cat.title}
                    </h3>
                    {cat.key !== "essential" && (
                      <label
                        data-testid={`cookie-toggle-${cat.key}`}
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <input
                          type="checkbox"
                          role="switch"
                          aria-checked={consent[cat.key]}
                          aria-labelledby={`cookie-title-${cat.key}`}
                          aria-describedby={`cookie-desc-${cat.key}`}
                          checked={consent[cat.key]}
                          onChange={() => toggleCategory(cat.key)}
                          className="peer sr-only"
                        />
                        <div className="pointer-events-none peer relative h-6 w-10 rounded-full bg-slate-strong after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2" />
                      </label>
                    )}
                  </div>
                  <p id={`cookie-desc-${cat.key}`} className="mt-1 text-xs text-navy-2">
                    {cat.description}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-navy-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-line p-4 sm:p-5">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              acceptAll()
              onClose()
            }}
          >
            {ar ? "قبول الكل" : "Accept All"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              rejectAll()
              onClose()
            }}
          >
            {ar ? "رفض الكل (الأساسية فقط)" : "Reject All (Essential Only)"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            {ar ? "حفظ وإغلاق" : "Save & Close"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

/* Script loaders — forward the stored choice to the analytics stack. */
function loadAnalytics() {
  if (typeof window === "undefined") return
  const win = window as Window & { gtag?: (...args: unknown[]) => void }
  win.gtag?.("consent", "update", { analytics_storage: "granted" })
}

function unloadAnalytics() {
  if (typeof window === "undefined") return
  const win = window as Window & { gtag?: (...args: unknown[]) => void }
  win.gtag?.("consent", "update", { analytics_storage: "denied" })
}

function loadMarketing() {
  if (typeof window === "undefined") return
  const win = window as Window & { gtag?: (...args: unknown[]) => void }
  win.gtag?.("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  })
}

function unloadMarketing() {
  if (typeof window === "undefined") return
  const win = window as Window & { gtag?: (...args: unknown[]) => void }
  win.gtag?.("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
}
