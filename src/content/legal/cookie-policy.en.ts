/**
 * Cookie Policy — English
 * Last updated: November 2026
 */

export const cookiePolicy = {
  meta: {
    title: "Cookie Policy",
    description: "How TerraMorph uses cookies and similar technologies on askterramorph.com.",
    lastUpdated: "2026-11-07",
  },

  sections: [
    {
      id: "what",
      heading: "What Are Cookies",
      body: [
        "Cookies are small text files stored on your device when you visit a website. They help the site function, remember preferences, and understand usage.",
        "Similar technologies: localStorage, sessionStorage, tracking pixels.",
      ],
    },
    {
      id: "categories",
      heading: "Cookie Categories",
      body: [
        "We use three categories. Only essential cookies are set without your consent.",
      ],
    },
    {
      id: "essential",
      heading: "Essential (Strictly Necessary) — No Consent Required",
      items: [
        {
          name: "tm_session",
          purpose: "Session authentication token (HMAC-SHA256 of random token). HttpOnly, Secure, SameSite=Lax/None. Expires 14 days.",
          domain: "askterramorph.com / api.askterramorph.com",
        },
        {
          name: "csrf_token",
          purpose: "CSRF protection for state-changing requests. Rotated per session.",
          domain: "askterramorph.com",
        },
        {
          name: "cookie_consent",
          purpose: "Stores your cookie consent choices (categories accepted/declined). 1 year expiry.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "analytics",
      heading: "Analytics — Consent Required",
      items: [
        {
          name: "_ga / _gid / _gat (if enabled)",
          purpose: "Google Analytics — page views, referrer, dwell time, pseudonymised IP. Only loaded after consent.",
          domain: "askterramorph.com",
        },
        {
          name: "plausible_* (if self-hosted Plausible)",
          purpose: "Privacy-friendly analytics — no personal data, no cookies by default. Only loaded after consent.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "marketing",
      heading: "Marketing — Consent Required (Not Used By Default)",
      items: [
        {
          name: "_fbp, _gcl_aw, etc.",
          purpose: "Conversion tracking for paid campaigns. Only loaded if you opt in AND we run paid campaigns.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "manage",
      heading: "Managing Your Preferences",
      body: [
        "Cookie banner: accessible via footer \"Cookie Preferences\" link at any time.",
        "Browser settings: block/delete cookies (may break essential functions).",
        "Withdraw consent: toggle categories off in banner; non-essential cookies deleted on next page load.",
      ],
    },
    {
      id: "third-party",
      heading: "Third-Party Cookies",
      body: [
        "We do not set third-party cookies directly.",
        "Embedded content (YouTube, LinkedIn, X/Twitter) may set their own cookies when you interact. We use privacy-enhanced embeds (youtube-nocookie, etc.) where available.",
      ],
    },
    {
      id: "retention",
      heading: "Retention Summary",
      items: [
        { name: "tm_session", retention: "14 days (rolling)" },
        { name: "csrf_token", retention: "Session" },
        { name: "cookie_consent", retention: "1 year" },
        { name: "Analytics cookies", retention: "14 months (Google) / per provider" },
        { name: "Marketing cookies", retention: "Per provider (max 13 months)" },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      body: [
        "Questions: info@askterramorph.com",
      ],
    },
  ],
};

export default cookiePolicy;