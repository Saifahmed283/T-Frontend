/**
 * Privacy Policy — English
 * Last updated: November 2026
 * Jurisdiction: Egypt PDPL (Law No. 151 of 2020) with GDPR-aligned provisions
 *
 * REVIEW WITH LEGAL COUNSEL BEFORE PUBLISHING
 */

export const privacyPolicy = {
  meta: {
    title: "Privacy Policy",
    description: "How TerraMorph Advisory LLC collects, uses, and protects your personal data under Egypt PDPL and international standards.",
    lastUpdated: "2026-11-07",
    effectiveDate: "2026-11-07",
    version: "1.0",
  },

  sections: [
    {
      id: "controller",
      heading: "1. Data Controller",
      body: [
        "TerraMorph Advisory LLC (\"we\", \"us\", \"our\") is the data controller for personal data processed through this website and our advisory services.",
        "Commercial Registration: CR No. 184 562 · Cairo",
        "Tax ID: TIN 742-118-903",
        "Registered address: New Cairo, Egypt",
        "Contact: privacy@askterramorph.com",
      ],
    },
    {
      id: "scope",
      heading: "2. Scope & Applicable Law",
      body: [
        "This policy covers personal data collected via askterramorph.com, our client portal, and related advisory engagements.",
        "Primary jurisdiction: Egypt Personal Data Protection Law (PDPL) No. 151 of 2020 and its Executive Regulations.",
        "Where we process data of individuals in the EU/UK, we apply GDPR/UK GDPR standards as a baseline.",
        "This policy does not cover third-party websites linked from our site.",
      ],
    },
    {
      id: "categories",
      heading: "3. Categories of Personal Data We Process",
      body: [
        "Identity data: name, email, phone, organisation, role (from contact forms, portal registration, newsletter signup).",
        "Engagement data: project scope, deliverables, billing records, correspondence (from client engagements).",
        "Technical data: IP address, browser type, pages visited, referrer, session timestamps (via server logs and analytics).",
        "Cookie data: preferences, consent choices, session identifiers (see Cookie Policy).",
        "Marketing data: consent preferences, email open/click rates (only with explicit opt-in).",
        "We do not process special category data (health, biometrics, children's data) unless you provide it voluntarily for a specific engagement, in which case we seek explicit consent.",
      ],
    },
    {
      id: "lawful-basis",
      heading: "4. Lawful Bases (PDPL Articles 5–6 / GDPR Article 6)",
      body: [
        "Contract performance: processing necessary to deliver advisory services, manage engagements, and invoice.",
        "Legal obligation: tax, anti-money laundering, professional standards retention requirements.",
        "Legitimate interests: improving our website, security, fraud prevention, aggregated analytics (balanced against your rights).",
        "Consent: marketing emails, non-essential cookies, processing special category data. You may withdraw consent at any time.",
        "Vital interests / public task: not applicable to our processing.",
      ],
    },
    {
      id: "purposes",
      heading: "5. Purposes of Processing",
      body: [
        "Deliver and manage advisory engagements.",
        "Communicate with clients and prospects (service-related only unless you opt in to marketing).",
        "Operate and secure the website and client portal.",
        "Comply with legal, regulatory, and professional obligations (tax, AML, record-keeping).",
        "Analyse website usage to improve content and navigation (aggregated, pseudonymised).",
        "Send marketing communications only where you have explicitly opted in.",
      ],
    },
    {
      id: "retention",
      heading: "6. Data Retention",
      body: [
        "Engagement records (contracts, deliverables, billing): 10 years from engagement end (Egypt tax law, professional standards).",
        "Correspondence related to engagements: 7 years from last contact.",
        "Website analytics (IP, pages, referrer): 14 months (pseudonymised after 30 days).",
        "Cookie consent logs: 2 years from consent/withdrawal.",
        "Marketing consent records: until withdrawal + 2 years for suppression list.",
        "Job applications: 12 months from rejection unless you consent to talent pool retention.",
        "We delete or anonymise data when retention periods expire, unless a legal hold applies.",
      ],
    },
    {
      id: "sharing",
      heading: "7. Sharing & Sub-Processors",
      body: [
        "We do not sell personal data.",
        "Sub-processors (with DPAs in place):",
        "• Hosting: Neon (PostgreSQL, serverless functions) — USA/EU regions",
        "• Email: Transactional provider (configured per environment) — see sub-processor list",
        "• Analytics: Self-hosted / privacy-friendly (no Google Analytics by default)",
        "• Payment: Not applicable (we invoice; no card data on our systems)",
        "Professional advisors: legal, audit, insurance (confidentiality-bound).",
        "Authorities: when legally compelled (court order, regulatory request).",
        "We publish a sub-processor list at /legal/sub-processors and notify material changes.",
      ],
    },
    {
      id: "international",
      heading: "8. International Transfers",
      body: [
        "Our primary database and functions run on Neon (Egypt/EU regions). Where sub-processors are outside Egypt, we rely on:",
        "• Adequacy decisions (where applicable)",
        "• Standard Contractual Clauses (SCCs) approved by Egypt's Data Protection Authority or EU Commission",
        "• Binding Corporate Rules (where applicable)",
        "• Your explicit consent (for specific transfers)",
        "Contact privacy@askterramorph.com for the current transfer mechanism register.",
      ],
    },
    {
      id: "rights",
      heading: "9. Your Rights (PDPL Articles 13–19 / GDPR Articles 15–22)",
      body: [
        "Access: confirm whether we process your data and obtain a copy.",
        "Rectification: correct inaccurate or incomplete data.",
        "Erasure (\"right to be forgotten\"): request deletion where retention no longer applies.",
        "Restriction: limit processing while a dispute is resolved.",
        "Portability: receive your data in a structured, machine-readable format.",
        "Object: object to processing based on legitimate interests or direct marketing.",
        "Withdraw consent: where processing relies on consent, withdraw at any time (does not affect lawfulness before withdrawal).",
        "Not subject to automated decision-making with legal/similar effects (we do not use such systems).",
        "How to exercise: email privacy@askterramorph.com or use the portal's Data Request page. We respond within 30 days (extendable by 60 days for complexity). No fee unless request is manifestly unfounded/excessive.",
      ],
    },
    {
      id: "security",
      heading: "10. Security Measures",
      body: [
        "Encryption in transit (TLS 1.2+) and at rest (AES-256 via Neon).",
        "Session tokens: HMAC-SHA256 stored, httpOnly/Secure/SameSite cookies.",
        "Role-based access control (admin/lead/member) in portal.",
        "Rate limiting, CSRF protection, Origin validation on state-changing requests.",
        "Regular dependency scanning, vulnerability assessments.",
        "Incident response plan: 72-hour notification to authority and affected data subjects where high risk (PDPL Art. 23 / GDPR Art. 33).",
      ],
    },
    {
      id: "cookies",
      heading: "11. Cookies & Similar Technologies",
      body: [
        "Essential (no consent): session cookie (tm_session), CSRF token, consent preference cookie.",
        "Analytics (consent required): pseudonymised page views, referrer, dwell time.",
        "Marketing (consent required): not used by default; would require explicit opt-in.",
        "Manage preferences via the cookie banner (footer link) or browser settings.",
        "See our Cookie Policy for the full cookie register.",
      ],
    },
    {
      id: "children",
      heading: "12. Children's Data",
      body: [
        "Our services are not directed to individuals under 16.",
        "We do not knowingly collect children's data. If we learn we have collected data from a child under 16 without verifiable parental consent, we delete it promptly.",
        "Parental consent: verified via government ID + signed consent form before any processing.",
      ],
    },
    {
      id: "marketing",
      heading: "13. Marketing Communications",
      body: [
        "We only send marketing emails with your explicit, granular opt-in (separate checkbox, not pre-ticked).",
        "Every marketing email includes a one-click unsubscribe link (List-Unsubscribe header + visible link).",
        "Unsubscribe is processed within 2 business days; suppression list retained indefinitely.",
        "Transactional emails (invoices, engagement updates, security notices) are not marketing and do not require opt-in.",
      ],
    },
    {
      id: "ai",
      heading: "14. AI & Automated Processing",
      body: [
        "We do not use your personal data to train AI models.",
        "Any AI-assisted work product on your engagement is reviewed by a named consultant; you are informed in the engagement letter.",
        "No automated decision-making with legal or similarly significant effects.",
      ],
    },
    {
      id: "changes",
      heading: "15. Changes to This Policy",
      body: [
        "We may update this policy. Material changes: posted here with revised date, and notified via email (if we have your contact) or portal banner 30 days before effect.",
        "Continued use after effective date constitutes acceptance of the revised policy.",
      ],
    },
    {
      id: "complaints",
      heading: "16. Complaints & Supervisory Authority",
      body: [
        "You may lodge a complaint with Egypt's Personal Data Protection Authority (or your local EU supervisory authority if GDPR applies).",
        "We encourage you to contact us first at privacy@askterramorph.com so we can resolve the issue.",
      ],
    },
  ],
};

export default privacyPolicy;