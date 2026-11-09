"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { X, Cookie, Shield, Check, ChevronDown, ChevronUp } from "lucide-react";

import { Button, Badge } from "@/components/ui";
import { useLang } from "@/pages/site/SitePage";

/* Cookie consent categories */
export type CookieCategory = "essential" | "analytics" | "marketing";

export interface CookieConsentState {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string; // ISO string of last update
  version: number; // consent version for future migrations
}

const DEFAULT_CONSENT: CookieConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
  version: 1,
};

const CONSENT_KEY = "cookie_consent";
const CONSENT_VERSION = 1;

interface CookieConsentContextValue {
  consent: CookieConsentState;
  showBanner: boolean;
  mounted: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  toggleCategory: (category: CookieCategory) => void;
  openPreferences: () => void;
  closeBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}

function readConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    // Migration: if version mismatch, reset non-essential
    if (parsed.version !== CONSENT_VERSION) {
      return { ...DEFAULT_CONSENT, version: CONSENT_VERSION, timestamp: new Date().toISOString() };
    }
    return { ...DEFAULT_CONSENT, ...parsed };
  } catch {
    return null;
  }
}

function writeConsent(consent: CookieConsentState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  // Also set a cookie for server-side reading (same-site, 1 year)
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

function deleteNonEssentialCookies() {
  if (typeof document === "undefined") return;
  // Delete known analytics/marketing cookies
  const cookiesToDelete = [
    "_ga", "_gid", "_gat", "_ga_*", // Google Analytics
    "plausible_*", // Plausible
    "_fbp", "_gcl_aw", "_gcl_dc", // Meta/Google Ads
    "_clck", "_clsk", // Clarity
  ];
  cookiesToDelete.forEach((name) => {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; path=/; domain=.askterramorph.com; max-age=0; SameSite=Lax`;
  });
  // Clear localStorage analytics keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("_ga") || key.startsWith("plausible") || key.startsWith("_fbp") || key.startsWith("_gcl")) {
      localStorage.removeItem(key);
    }
  });
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_CONSENT);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = readConsent();
    if (saved) {
      setConsent(saved);
      // Don't show banner if consent already given
      setShowBanner(false);
    } else {
      // First visit - show banner after a brief delay
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
    // Load analytics scripts if consented
    if (saved?.analytics) loadAnalytics();
    if (saved?.marketing) loadMarketing();
  }, []);

  const updateConsent = useCallback((updates: Partial<CookieConsentState>) => {
    const newConsent = {
      ...consent,
      ...updates,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    setConsent(newConsent);
    writeConsent(newConsent);

    // Load/unload scripts based on consent changes
    if (updates.analytics === true) loadAnalytics();
    if (updates.analytics === false) unloadAnalytics();
    if (updates.marketing === true) loadMarketing();
    if (updates.marketing === false) unloadMarketing();
  }, [consent]);

  const acceptAll = useCallback(() => {
    updateConsent({ analytics: true, marketing: true });
    setShowBanner(false);
    setShowPreferences(false);
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({ analytics: false, marketing: false });
    deleteNonEssentialCookies();
    setShowBanner(false);
    setShowPreferences(false);
  }, [updateConsent]);

  const toggleCategory = useCallback((category: CookieCategory) => {
    if (category === "essential") return; // Essential cannot be toggled
    updateConsent({ [category]: !consent[category] });
  }, [consent, updateConsent]);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
    setShowBanner(true);
  }, []);

  const closeBanner = useCallback(() => {
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const value: CookieConsentContextValue = {
    consent,
    showBanner: mounted && showBanner,
    mounted,
    acceptAll,
    rejectAll,
    toggleCategory,
    openPreferences,
    closeBanner,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {mounted && showBanner && <CookieBannerUI onClose={closeBanner} onOpenPreferences={openPreferences} />}
      {mounted && showPreferences && <CookiePreferencesModal onClose={() => setShowPreferences(false)} />}
    </CookieConsentContext.Provider>
  );
}

/* Banner UI */
function CookieBannerUI({ onClose, onOpenPreferences }: { onClose: () => void; onOpenPreferences: () => void }) {
  const { lang } = useLang()
  const ar = lang === "ar"
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-auto md:right-4 md:w-[420px] animate-slide-up"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-desc"
    >
      <div className="bg-white border border-line rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Cookie className="text-gold-strong" size={20} aria-hidden="true" />
            <div>
              <p id="cookie-banner-desc" className="font-medium text-navy text-sm">
                {ar ? "نحترم خصوصيتك" : "We value your privacy"}
              </p>
              <p className="text-xs text-navy-2 mt-0.5">
                {ar
                  ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل زيارات الموقع. ملفات الارتباط الأساسية لا يمكن إيقافها."
                  : "We use cookies to improve your experience and analyse site traffic. Essential cookies cannot be disabled."}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-strong hover:text-navy p-1" onClick={onClose} aria-label={ar ? "إغلاق الشريط" : "Dismiss banner"}>
            <X size={18} />
          </Button>
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-gold-strong" size={16} />
              <span className="font-medium text-navy">Essential</span>
              <Badge tone="neutral" className="text-xs">Always on</Badge>
            </div>
            <span className="text-xs text-slate-strong">
              {ar ? "الجلسة، الحماية، التفضيلات" : "Session, security, preferences"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy">
                {ar ? "إحصائيات الاستخدام" : "Analytics"}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenPreferences}
              className="min-w-[80px]"
            >
              {ar ? "إدارة" : "Manage"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy">
                {ar ? "التسويق" : "Marketing"}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenPreferences}
              className="min-w-[80px]"
            >
              {ar ? "إدارة" : "Manage"}
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
            {ar ? "قبول الكل" : "Accept all"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onOpenPreferences} className="flex-1 sm:flex-none">
            {ar ? "إدارة التفضيلات" : "Manage preferences"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { onClose(); onOpenPreferences(); }} className="flex-1 sm:flex-none">
            {ar ? "رفض الكل" : "Reject all"}
          </Button>
        </div>

        <p className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-strong text-center border-t border-line">
          <a href="/legal/cookie-policy" className="underline decoration-gold underline-offset-2 hover:text-navy">
            {ar ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
          </a>{" "}
          ·{" "}
          <a href="/legal/privacy-policy" className="underline decoration-gold underline-offset-2 hover:text-navy">
            {ar ? "سياسة الخصوصية" : "Privacy Policy"}
          </a>
        </p>
      </div>
    </div>
  );
}

/* Preferences Modal */
function CookiePreferencesModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const { consent, toggleCategory, acceptAll, rejectAll, closeBanner } = useCookieConsent();

  const categories = [
    {
      key: "essential" as const,
      title: ar ? "ملفات تعريف الارتباط الأساسية" : "Essential Cookies",
      description: ar ? "ضرورية لعمل الموقع بشكل صحيح. لا يمكن إيقافها." : "Required for the website to function properly. Cannot be disabled.",
      icon: Shield,
      items: ar
        ? ["مصادقة الجلسة (tm_session)", "حماية CSRF", "تفضيلات ملفات تعريف الارتباط"]
        : ["Session authentication (tm_session)", "CSRF protection", "Cookie consent preferences"],
    },
    {
      key: "analytics" as const,
      title: ar ? "ملفات تعريف الإحصائيات" : "Analytics Cookies",
      description: ar ? "تساعدنا في فهم كيفية تفاعل الزوار مع موقعنا (مُعرّضات بشكل مستعار)." : "Help us understand how visitors interact with our site (pseudonymised).",
      icon: Cookie,
      items: ar
        ? ["مشاهدات الصفحات، المحيل، وقت البقاء", "عنوان IP مستعار (مُخفي)", "لا تحتوي على معرفات شخصية"]
        : ["Page views, referrer, dwell time", "Pseudonymised IP address", "No personal identifiers"],
    },
    {
      key: "marketing" as const,
      title: ar ? "ملفات تعريف التسويق" : "Marketing Cookies",
      description: ar ? "تُستخدم لتقديم إعلانات ذات صلة وقياس فعالية الحملات." : "Used to deliver relevant ads and measure campaign effectiveness.",
      icon: Cookie,
      items: ar
        ? ["تتبع التحويلات (ميتا، غوغل)", "جماهير الاستهداف", "فقط إذا كانت لدينا حملات إعلانية مدفوعة"]
        : ["Conversion tracking (Meta, Google)", "Retargeting audiences", "Only if we run paid campaigns"],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <h2 id="cookie-modal-title" className="font-medium text-navy">
            {ar ? "تفضيلات ملفات تعريف الارتباط" : "Cookie Preferences"}
          </h2>
          <Button variant="ghost" size="sm" className="p-1" onClick={onClose} aria-label={ar ? "إغلاق التفضيلات" : "Close preferences"}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.key} className="border border-line rounded-lg p-4">
              <div className="flex items-start gap-3">
                <cat.icon className="text-gold-strong mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-navy">{cat.title}</h3>
                    {cat.key !== "essential" && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent[cat.key]}
                          onChange={() => toggleCategory(cat.key)}
                          className="sr-only peer"
                          disabled={false}
                        />
                        <div className="w-10 h-6 bg-slate-strong peer-focus:ring-2 peer-focus:ring-gold peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-navy-2">{cat.description}</p>
                  <ul className="mt-2 space-y-1 text-xs text-navy-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-5 border-t border-line flex flex-col gap-2">
          <Button variant="primary" className="w-full" onClick={() => { acceptAll(); onClose(); }}>
            {ar ? "قبول الكل" : "Accept All"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => { rejectAll(); onClose(); }}>
            {ar ? "رفض الكل (الأساسية فقط)" : "Reject All (Essential Only)"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            {ar ? "حفظ وإغلاق" : "Save & Close"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Script loaders - implement based on your analytics stack */
function loadAnalytics() {
  if (typeof window === "undefined") return;
  // Example: Google Analytics (gtag) - only load if not already loaded
  const win = window as Window & { gtag?: (...args: unknown[]) => void };
  if (!win.gtag && document.getElementById("ga-script")) return;
  // Add your analytics initialization here
}

function unloadAnalytics() {
  if (typeof window === "undefined") return;
  const win = window as Window & { gtag?: (...args: unknown[]) => void };
  // Disable analytics - gtag('consent', 'update', { analytics_storage: 'denied' })
  win.gtag?.("consent", "update", { analytics_storage: "denied" });
}

function loadMarketing() {
  if (typeof window === "undefined") return;
}

function unloadMarketing() {
  if (typeof window === "undefined") return;
}