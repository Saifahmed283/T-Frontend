import type { SectionId } from "@/lib/routes"

/*
 * Dedicated footer pages.
 *
 * Every footer link resolves to a real, dated page. Content is data-driven so a
 * single renderer (pages/site/pages/DetailPage) can present any of them, and the
 * block union below is the contract between content and layout.
 */

export type ColumnKey = "Evidence" | "Method" | "Knowledge" | "Learning" | "About" | "Join"

export const columnMeta: Record<ColumnKey, {
  n: string
  section: SectionId
  blurb: string
}> = {
  Evidence: {
    n: "01",
    section: "evidence",
    blurb: "Dated, named proof a procurement reader can verify.",
  },
  Method: {
    n: "02",
    section: "cause",
    blurb: "How the work is structured, priced and transferred.",
  },
  Knowledge: {
    n: "03",
    section: "knowledge",
    blurb: "Publications, briefs, data products and the podcast.",
  },
  Learning: {
    n: "04",
    section: "learning",
    blurb: "Programmes, certification and academy licensing.",
  },
  About: {
    n: "05",
    section: "about",
    blurb: "The people, the philosophy and the compliance file.",
  },
  Join: {
    n: "06",
    section: "join-board",
    blurb: "Careers, expert registration and open opportunities.",
  },
}

export type Tone = "ok" | "warn" | "risk" | "neutral" | "gold"

export type Block = {
  kind: "prose"
  heading?: string
  body: string[]
} | {
  kind: "stats"
  heading?: string
  aside?: string
  items: {
    value: string
    label: string
    note?: string
  }[]
} | {
  kind: "table"
  heading?: string
  aside?: string
  note?: string
  columns: string[]
  rows: string[][]
} | {
  kind: "cards"
  heading?: string
  aside?: string
  items: {
    kicker?: string
    title: string
    body: string
    meta?: string
    badge?: string
    href?: string
  }[]
} | {
  kind: "list"
  heading?: string
  aside?: string
  items: {
    title: string
    meta?: string
    body?: string
    tag?: string
    href?: string
  }[]
} | {
  kind: "figure"
  heading?: string
  src?: string
  alt: string
  eyebrow?: string
  title?: string
  caption?: string
  credit?: string
  ratio?: string
  ink?: boolean
} | {
  kind: "timeline"
  heading?: string
  aside?: string
  items: {
    step: string
    title: string
    meta?: string
    body: string
  }[]
} | {
  kind: "faq"
  heading?: string
  aside?: string
  items: {
    q: string
    a: string
  }[]
} | {
  kind: "team"
  heading?: string
  aside?: string
  people: {
    name: string
    role: string
    focus: string
  }[]
} | {
  kind: "calendar"
  heading?: string
  aside?: string
  items: {
    date: string
    month: string
    title: string
    format: string
    status: string
    tone?: Tone
  }[]
} | {
  kind: "links"
  heading?: string
  aside?: string
  items: {
    label: string
    meta?: string
    href: string
    badge?: string
  }[]
} | {
  kind: "quote"
  text: string
  attribution: string
} | {
  kind: "cta"
  title: string
  body: string
  actions: {
    label: string
    href: string
    primary?: boolean
  }[]
}

export type PageDef = {
  slug: string
  path: string
  column: ColumnKey
  label: string
  eyebrow: string
  title: string
  lede: string
  meta: string
  tags?: string[]
  updated?: string
  blocks: Block[]
}

export const PAGES: PageDef[] = [
  // Evidence
  {
    slug: "assignment-ledger",
    path: "/evidence/assignment-ledger",
    column: "Evidence",
    label: "Assignment ledger",
    eyebrow: "Evidence · Ledger",
    title: "The assignment ledger.",
    lede: "Every engagement we have ever run — client type, country, sector, year and size band. Named and dated, so a procurement reader can verify the whole record rather than take our word for it.",
    meta: "The full TerraMorph assignment ledger: dated, named engagements with client type, country, sector and size band.",
    tags: ["Ledger", "Transparency", "Procurement-ready"],
    updated: "September 2026",
    blocks: [
      {
        kind: "figure",
        alt: "The assignment ledger rendered as a dated, filterable record",
        eyebrow: "Evidence · 2019–2026",
        title: "Fifty-eight engagements, dated and named.",
        caption:
          "A live record a procurement reader can filter and verify — not a selected list.",
        credit: "TerraMorph · assignment ledger",
      },
      {
        kind: "stats",
        items: [
          { value: "58", label: "Assignments delivered", note: "2019–2026" },
          { value: "9", label: "Countries covered", note: "MENA & EU" },
          {
            value: "7",
            label: "Practice areas",
            note: "LED to social enterprise",
          },
          { value: "94%", label: "Repeat or referred", note: "of client base" },
        ],
      },
      {
        kind: "table",
        heading: "Ledger entries",
        aside:
          "Sorted newest first. Size bands follow the client’s own tender thresholds where published.",
        columns: ["Year", "Assignment", "Client", "Sector", "Country", "Size"],
        rows: [
          [
            "2026",
            "Blended-finance structure, women-led agri cooperative",
            "Delta Impact Fund",
            "Social enterprise",
            "Egypt",
            "< USD 100k",
          ],
          [
            "2026",
            "Investment climate action plan",
            "Ministry of Planning",
            "Investment climate",
            "Egypt",
            "USD 250–500k",
          ],
          [
            "2025",
            "Governorate investment map, phase I–II",
            "Assiut Governorate",
            "Local economic development",
            "Egypt",
            "USD 100–250k",
          ],
          [
            "2025",
            "Main-street LED pilot design",
            "Municipal authority",
            "Local economic development",
            "Egypt",
            "< USD 100k",
          ],
          [
            "2024",
            "Employer-validated curricula for 14 schools",
            "GIZ programme",
            "TVET & skills",
            "Egypt",
            "USD 100–250k",
          ],
          [
            "2024",
            "SME regulatory burden review",
            "Chamber of commerce",
            "Policy",
            "Jordan",
            "< USD 100k",
          ],
          [
            "2023",
            "Train-the-trainer certification framework",
            "AAST Academy",
            "TVET & skills",
            "Egypt",
            "< USD 100k",
          ],
          [
            "2023",
            "Regional logistics corridor pre-feasibility",
            "Development partner",
            "Infrastructure",
            "Morocco",
            "USD 100–250k",
          ],
        ],
        note: "Client names are shown where the contract permits; sensitive clients are listed by type and country only.",
      },
      {
        kind: "prose",
        heading: "How the ledger stays honest.",
        body: [
          "The ledger is maintained under the same mandate note that governs every engagement — if we cannot name the client or the year, the row does not go in.",
          "Where a client requires anonymity we publish the client type and country instead, and mark the row accordingly. No engagement is ever retro-fitted to a favourable size band.",
        ],
      },
      {
        kind: "cta",
        title: "Need the ledger in your procurement format?",
        body: "We export the ledger as a signed PDF and a machine-readable CSV, mapped to standard eligibility fields, on request within two working days.",
        actions: [
          {
            label: "Request the signed ledger",
            href: "/contact",
            primary: true,
          },
          { label: "See case studies", href: "/evidence/case-studies" },
        ],
      },
    ],
  },
  {
    slug: "case-studies",
    path: "/evidence/case-studies",
    column: "Evidence",
    label: "Case studies",
    eyebrow: "Evidence · Case studies",
    title: "Case studies, written to be checked.",
    lede: "Each study states the problem, the lever we pulled, the outcome and — crucially — how a reader can verify it. No adjectives stand in for a number.",
    meta: "TerraMorph case studies: the constraint, the lever, the verified outcome, and how to check it.",
    tags: ["Cases", "Outcomes", "Verifiable"],
    updated: "August 2026",
    blocks: [
      {
        kind: "figure",
        alt: "A governorate investment map produced with the authority’s own planning team",
        eyebrow: "Assiut Governorate · 2025",
        title: "A governorate investment map that moved EGP 1.2bn.",
        caption:
          "Three under-used industrial zones matched to 46 bankable uses — the register, not a new incentive, was the lever.",
        credit: "TerraMorph · assignment ledger",
      },
      {
        kind: "cards",
        heading: "Selected cases",
        aside: "Four of the assignments procurement teams ask about most.",
        items: [
          {
            kicker: "Local economic development · 2025",
            title: "A governorate investment map that moved EGP 1.2bn",
            body: "Three under-used industrial zones were matched to 46 bankable uses. The lever was a public land-bank register, not a new incentive.",
            meta: "Assiut Governorate",
            badge: "Public sector",
          },
          {
            kicker: "TVET & skills · 2024",
            title:
              "Re-tooling 14 technical schools around employer-validated curricula",
            body: "Employers co-signed every module. Graduation-into-job within 90 days rose from 21% to 48% across the cohort.",
            meta: "GIZ programme",
            badge: "Development partners",
          },
          {
            kicker: "Social enterprise · 2026",
            title:
              "Blended finance for a women-led agri-processing cooperative",
            body: "A first-loss tranche unlocked a matching commercial facility. 340 smallholder suppliers gained a fixed-price off-take.",
            meta: "Delta Impact Fund",
            badge: "NGOs",
          },
          {
            kicker: "Policy · 2024",
            title: "SME regulatory burden review for a national chamber",
            body: "Eleven of fourteen identified burdens were removed or simplified within eighteen months of the report.",
            meta: "Chamber of commerce",
            badge: "Policy",
          },
        ],
      },
      {
        kind: "quote",
        text: "They did not hand us a strategy deck. They left our own team able to run the diagnostic next time.",
        attribution: "Director of planning, governorate authority",
      },
      {
        kind: "prose",
        heading: "What every case study contains.",
        body: [
          "A named client type and date, the binding constraint as diagnosed, the instrument chosen and why the alternatives were rejected, the verified outcome against baseline, and a line telling the reader how to check it.",
        ],
      },
      {
        kind: "cta",
        title: "Want a full case study or a reference call?",
        body: "We can share the extended study and connect you with the client reference where the contract allows.",
        actions: [
          {
            label: "Request a reference call",
            href: "/contact",
            primary: true,
          },
          { label: "Browse the ledger", href: "/evidence/assignment-ledger" },
        ],
      },
    ],
  },
  {
    slug: "impact-report",
    path: "/evidence/impact-report",
    column: "Evidence",
    label: "Impact report (annual)",
    eyebrow: "Evidence · Annual impact",
    title: "Impact report 2026.",
    lede: "Our annual account of what the work changed: indicators, baselines, verified results and the method behind each. Published with the data, so anyone can re-check it.",
    meta: "TerraMorph Impact Report 2026: verified indicators, baselines and outcomes across the portfolio.",
    tags: ["Annual", "Indicators", "Open data"],
    updated: "September 2026",
    blocks: [
      {
        kind: "figure",
        alt: "The impact report dashboard of verified indicators",
        eyebrow: "Evidence · Annual",
        title: "Impact report 2026, published with its data.",
        caption:
          "Indicators verified against engagement baselines, not self-reported.",
        credit: "TerraMorph · Impact Report 2026",
      },
      {
        kind: "stats",
        heading: "Headline results",
        aside:
          "All figures verified against engagement baselines, not self-reported.",
        items: [
          {
            value: "EGP 1.9bn",
            label: "Capital catalysed",
            note: "public + private, 2026",
          },
          {
            value: "4,100",
            label: "People trained",
            note: "incl. 220 certified",
          },
          {
            value: "11",
            label: "Policies improved",
            note: "adopted or in force",
          },
          {
            value: "0.7",
            label: "USD leverage per USD fee",
            note: "portfolio median",
          },
        ],
      },
      {
        kind: "table",
        heading: "Indicator scorecard",
        aside:
          "Baseline, target and verified result for the five core indicators.",
        columns: ["Indicator", "Baseline", "Target", "Verified", "Status"],
        rows: [
          ["Jobs created or formalised", "—", "1,200", "1,460", "Met"],
          ["MSMEs accessing new finance", "180", "400", "512", "Met"],
          ["Training completion rate", "61%", "80%", "86%", "Met"],
          [
            "Policy adoption within 18 months",
            "40%",
            "60%",
            "55%",
            "In progress",
          ],
          ["Client self-delivery after transfer", "—", "70%", "78%", "Met"],
        ],
      },
      {
        kind: "prose",
        heading: "How we keep ourselves honest.",
        body: [
          'Every indicator is fixed at mandate stage, measured against a baseline we publish, and reported whether or not it was met. The one indicator currently "in progress" is reported as such.',
          "Where a result cannot be attributed cleanly to our work, we say so and report the contribution range instead of a point estimate.",
        ],
      },
      {
        kind: "links",
        heading: "Download the report",
        items: [
          {
            label: "Impact Report 2026 — English",
            meta: "PDF · 48 pp · open licence",
            href: "/contact",
            badge: "EN",
          },
          {
            label: "تقرير الأثر 2026 — العربية",
            meta: "PDF · 52 pp · رخصة مفتوحة",
            href: "/contact",
            badge: "AR",
          },
          {
            label: "Underlying indicator dataset",
            meta: "CSV · CC BY 4.0",
            href: "/knowledge/data-products",
          },
        ],
      },
      {
        kind: "cta",
        title: "Discuss the findings with us.",
        body: "We run a quarterly reader session on the impact data — anyone can join and challenge the numbers.",
        actions: [
          {
            label: "Join the next session",
            href: "/learning/calendar",
            primary: true,
          },
          { label: "Explore data products", href: "/knowledge/data-products" },
        ],
      },
    ],
  },
  {
    slug: "clients-references",
    path: "/evidence/clients-references",
    column: "Evidence",
    label: "Clients & references",
    eyebrow: "Evidence · Clients & references",
    title: "Clients & references.",
    lede: "Who we work for, and who is willing to speak for us. References are given by named individuals on request — never a generic testimonial page.",
    meta: "TerraMorph clients and reference policy: who we serve and how to request a named reference.",
    tags: ["Clients", "References", "Trust"],
    updated: "July 2026",
    blocks: [
      {
        kind: "figure",
        alt: "A working session with a client institution",
        eyebrow: "Evidence · Trust",
        title: "References come from named people, not a testimonial page.",
        caption: "Released with a signed consent note, per client.",
        credit: "TerraMorph",
      },
      {
        kind: "cards",
        heading: "Who we serve",
        items: [
          {
            kicker: "Public sector",
            title: "Governorates, ministries & authorities",
            body: "Mandate-mapped work performed inside the client’s own rules and procurement framework.",
            badge: "21 engagements",
          },
          {
            kicker: "Development partners",
            title: "Programmes & donor-funded projects",
            body: "Registered, framework-eligible delivery with a full assignment ledger behind every claim.",
            badge: "16 engagements",
          },
          {
            kicker: "Business",
            title: "Enterprises & investors",
            body: "A price-bearing diagnostic and a bookable date — not a sales call.",
            badge: "11 engagements",
          },
          {
            kicker: "Civil society",
            title: "NGOs & social enterprises",
            body: "Free method notes, open-licence tools and a scaled engagement model.",
            badge: "10 engagements",
          },
        ],
      },
      {
        kind: "list",
        heading: "Reference contacts",
        aside:
          "Named referees are released with a signed consent note, per client.",
        items: [
          {
            title: "Governorate authority · LED",
            meta: "Upper Egypt · 2025",
            body: "Director of planning — available for reference calls.",
            tag: "Public",
          },
          {
            title: "Development partner · TVET",
            meta: "Egypt · 2024",
            body: "Programme manager — available for reference calls.",
            tag: "Donor",
          },
          {
            title: "Impact fund · Social enterprise",
            meta: "Delta region · 2026",
            body: "Investment director — available with consent.",
            tag: "Private",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Our reference policy.",
        body: [
          "We never publish a client name, logo or quote without written consent, and we never present a testimonial we cannot attribute to a person willing to be contacted.",
          "A prospective client can request up to three reference conversations per pursuit. We arrange them directly and do not coach the referee on what to say.",
        ],
      },
      {
        kind: "cta",
        title: "Ask for a reference.",
        body: "Tell us the sector and the decision you are de-risking, and we will propose the most relevant referees.",
        actions: [
          { label: "Request references", href: "/contact", primary: true },
          { label: "See certifications", href: "/evidence/certifications" },
        ],
      },
    ],
  },
  {
    slug: "certifications",
    path: "/evidence/certifications",
    column: "Evidence",
    label: "Certifications",
    eyebrow: "Evidence · Certifications",
    title: "Certifications & compliance marks.",
    lede: "The certificates we hold, who issued them, the scope they cover and when they expire. Verified copies are released to procurement teams on request.",
    meta: "TerraMorph certifications: ISO 37001, ISO 27001 and registration marks with issuing bodies and validity.",
    tags: ["ISO 37001", "ISO 27001", "Registered"],
    updated: "June 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Held certifications",
        items: [
          {
            kicker: "Anti-bribery",
            title: "ISO 37001:2022",
            body: "Certified anti-bribery management system covering all advisory engagements and supplier relationships.",
            badge: "Certified",
          },
          {
            kicker: "Information security",
            title: "ISO/IEC 27001:2022",
            body: "Certified information security management for client data, tenders and internal systems.",
            badge: "Certified",
          },
          {
            kicker: "Quality",
            title: "ISO 9001:2015",
            body: "Quality management system governing the G0–G7 delivery lifecycle and transfer.",
            badge: "Certified",
          },
        ],
      },
      {
        kind: "table",
        heading: "Register of certificates",
        columns: ["Certificate", "Issuing body", "Scope", "Valid until"],
        rows: [
          [
            "ISO 37001:2022",
            "International certifier",
            "Anti-bribery management",
            "Mar 2028",
          ],
          [
            "ISO/IEC 27001:2022",
            "International certifier",
            "Information security",
            "Jan 2027",
          ],
          [
            "ISO 9001:2015",
            "International certifier",
            "Quality management",
            "Nov 2027",
          ],
          [
            "Commercial registration",
            "Egyptian registry",
            "CR No. 184 562 · Cairo",
            "Rolling",
          ],
          [
            "Tax registration",
            "Egyptian tax authority",
            "TIN 742-118-903",
            "Rolling",
          ],
        ],
        note: "Certificate numbers and PDFs are provided to procurement teams under the compliance pack.",
      },
      {
        kind: "prose",
        heading: "What certification does not buy.",
        body: [
          "A certificate is a floor, not a finish line. It means the management system exists and is independently audited; it does not substitute for reading the ledger or calling a referee.",
        ],
      },
      {
        kind: "links",
        heading: "Compliance documents",
        items: [
          {
            label: "Compliance pack 2026",
            meta: "PDF · registrations, tax ID, insurers",
            href: "/contact",
            badge: "ZIP",
          },
          {
            label: "ISO 37001 certificate",
            meta: "PDF · verified copy",
            href: "/about/compliance",
          },
          {
            label: "Anti-bribery policy",
            meta: "PDF · AR/EN",
            href: "/about/compliance",
          },
        ],
      },
      {
        kind: "cta",
        title: "Need a verified certificate copy?",
        body: "We issue certified copies with a cover letter for tenders within one working day.",
        actions: [
          { label: "Request certificates", href: "/contact", primary: true },
        ],
      },
    ],
  },

  // Method
  {
    slug: "ldia-architecture",
    path: "/method/ldia",
    column: "Method",
    label: "The LDIA architecture",
    eyebrow: "Method · LDIA architecture",
    title: "The LDIA architecture.",
    lede: "Locate, Design, Implement, Assure — four layers that turn a mandate into a transferable result. LDIA is the spine that the G0–G7 lifecycle runs along.",
    meta: "The TerraMorph LDIA architecture: Locate, Design, Implement, Assure — the four layers behind every engagement.",
    tags: ["LDIA", "Architecture", "Framework"],
    updated: "May 2026",
    blocks: [
      {
        kind: "figure",
        alt: "A diagram of the LDIA architecture: Locate, Design, Implement, Assure",
        eyebrow: "Method · Four layers",
        title:
          "Locate, Design, Implement, Assure — one spine, every engagement.",
        caption:
          "LDIA runs along the G0–G7 lifecycle, with a defined output and owner at each layer.",
        credit: "TerraMorph method",
      },
      {
        kind: "cards",
        heading: "The four layers",
        aside:
          "Each layer has a defined output and a defined owner in the client institution.",
        items: [
          {
            kicker: "L — Locate",
            title: "Find the lever, not the list",
            body: "Diagnose the ground as it is and name the single binding constraint, with the smallest well-placed force that moves the largest outcome.",
            badge: "Layer 1",
          },
          {
            kicker: "D — Design",
            title: "Design costed instruments",
            body: "Each instrument carries options, owners, sequencing and its own risk register — never a single unexamined recommendation.",
            badge: "Layer 2",
          },
          {
            kicker: "I — Implement",
            title: "Deliver embedded, in place",
            body: "We sit inside the client institution and report monthly against agreed indicators, so drift is visible early.",
            badge: "Layer 3",
          },
          {
            kicker: "A — Assure",
            title: "Verify, publish, transfer",
            body: "Outcomes are measured against baseline, published with method, and the capability is handed over to trained people.",
            badge: "Layer 4",
          },
        ],
      },
      {
        kind: "timeline",
        heading: "How LDIA maps to G0–G7",
        items: [
          {
            step: "G0–G1",
            title: "Locate",
            meta: "Mandate + diagnose",
            body: "The mandate note fixes the question; the diagnostic names the constraint.",
          },
          {
            step: "G2–G4",
            title: "Design",
            meta: "Lever → align",
            body: "The lever map becomes a costed instrument, then a recorded coalition.",
          },
          {
            step: "G5",
            title: "Implement",
            meta: "Deliver",
            body: "Embedded delivery with a monthly dashboard against agreed indicators.",
          },
          {
            step: "G6–G7",
            title: "Assure",
            meta: "Measure + transfer",
            body: "Verified results published, method and tools handed to the client.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Why an architecture and not a template.",
        body: [
          "A template forces every problem into the same shape. LDIA fixes only the sequence and the gates — the instruments, indicators and parties change with the ground.",
          "That is why a governorate investment map and an agri-cooperative financing structure can both be delivered without either feeling like a borrowed method.",
        ],
      },
      {
        kind: "cta",
        title: "Walk through LDIA on your mandate.",
        body: "Bring a live question and we will map it to the four layers in a working session.",
        actions: [
          { label: "Book a working session", href: "/contact", primary: true },
          { label: "See the G0–G7 lifecycle", href: "/method/lifecycle" },
        ],
      },
    ],
  },
  {
    slug: "lifecycle",
    path: "/method/lifecycle",
    column: "Method",
    label: "G0–G7 lifecycle",
    eyebrow: "Method · G0–G7 lifecycle",
    title: "The G0–G7 lifecycle.",
    lede: "Eight gates from mandate to transfer. Each gate has a duration, a named output and a decision owner — nothing advances on a slide.",
    meta: "The TerraMorph G0–G7 delivery lifecycle: eight gates from mandate note to transfer kit, with outputs and timings.",
    tags: ["Lifecycle", "Gates", "Delivery"],
    updated: "May 2026",
    blocks: [
      {
        kind: "timeline",
        heading: "The eight gates",
        aside:
          "Typical durations; complex engagements expand G5 delivery under the same gates.",
        items: [
          {
            step: "G0",
            title: "Mandate",
            meta: "1–2 wks",
            body: "Fix the question, the client, the decision it serves and the rules it must live inside.",
          },
          {
            step: "G1",
            title: "Diagnose",
            meta: "2–4 wks",
            body: "Read the ground as it is and name the binding constraint, not list everything.",
          },
          {
            step: "G2",
            title: "Locate the lever",
            meta: "1–2 wks",
            body: "Find the smallest well-placed force that moves the largest outcome.",
          },
          {
            step: "G3",
            title: "Design",
            meta: "3–6 wks",
            body: "Costed options, owners and sequencing, each with its own risk register.",
          },
          {
            step: "G4",
            title: "Align",
            meta: "2–4 wks",
            body: "Build the coalition; record consultation and answer objections in writing.",
          },
          {
            step: "G5",
            title: "Deliver",
            meta: "Variable",
            body: "Embedded delivery with monthly dashboards against agreed indicators.",
          },
          {
            step: "G6",
            title: "Measure",
            meta: "Quarterly",
            body: "Verify outcomes against baseline and publish results with method.",
          },
          {
            step: "G7",
            title: "Transfer",
            meta: "4–8 wks",
            body: "Hand over method, tools and trained people — success is not needing us.",
          },
        ],
      },
      {
        kind: "stats",
        items: [
          { value: "8", label: "Gates", note: "every engagement" },
          {
            value: "16–24",
            label: "Typical weeks",
            note: "diagnostic to delivery",
          },
          { value: "3", label: "Client sign-off points", note: "G1, G4, G7" },
          {
            value: "100%",
            label: "Mandate notes",
            note: "before any work starts",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Gates are stops, not milestones.",
        body: [
          "A gate is a decision point where a client can stop, re-scope or continue. If the diagnostic in G1 does not identify a binding constraint, we say so and the engagement ends there rather than manufacturing a project.",
        ],
      },
      {
        kind: "cta",
        title: "See where your question sits.",
        body: "Most mandates enter at G0. Send us the decision you need to make and we will tell you the gate you are actually at.",
        actions: [
          { label: "Start at G0", href: "/contact", primary: true },
          { label: "See the instruments", href: "/method/instruments" },
        ],
      },
    ],
  },
  {
    slug: "instruments",
    path: "/method/instruments",
    column: "Method",
    label: "Instruments",
    eyebrow: "Method · Instruments",
    title: "Instruments.",
    lede: "The tools we deploy after the diagnostic. Each instrument is chosen to fit the constraint, carries a defined output, and can be licensed or transferred.",
    meta: "TerraMorph instruments: diagnostic, policy, finance, skills, data and convening tools, with outputs and use cases.",
    tags: ["Instruments", "Toolkit", "Transferable"],
    updated: "April 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Instrument families",
        items: [
          {
            kicker: "Diagnostic",
            title: "Binding-constraint diagnostic",
            body: "Reads institutions, incentives and data to isolate the one constraint worth moving.",
            badge: "G1",
          },
          {
            kicker: "Policy",
            title: "Regulatory burden review",
            body: "Maps the actual cost of rules on firms and ranks removals by effect per effort.",
            badge: "G2–G3",
          },
          {
            kicker: "Finance",
            title: "Blended-finance structuring",
            body: "Designs first-loss and matching tranches that unlock commercial capital.",
            badge: "G3",
          },
          {
            kicker: "Skills",
            title: "Employer-validated curricula",
            body: "Co-signs every module with employers so completion converts to jobs.",
            badge: "G3–G5",
          },
          {
            kicker: "Data",
            title: "Investment & land-bank maps",
            body: "Places bankable uses on a public register of sites and assets.",
            badge: "G2",
          },
          {
            kicker: "Convening",
            title: "Coalition & consultation design",
            body: "Runs recorded consultation that survives a change of minister.",
            badge: "G4",
          },
        ],
      },
      {
        kind: "table",
        heading: "When to use what",
        columns: ["Instrument", "Primary output", "Deploy at", "Transferable"],
        rows: [
          [
            "Binding-constraint diagnostic",
            "Diagnostic note",
            "G1",
            "Yes — template licensed",
          ],
          ["Regulatory burden review", "Ranked reform list", "G2–G3", "Yes"],
          [
            "Blended-finance structuring",
            "Finance structure",
            "G3",
            "Client retains",
          ],
          [
            "Employer-validated curricula",
            "Curriculum pack",
            "G3–G5",
            "Yes — with trainers",
          ],
          [
            "Investment & land-bank maps",
            "Interactive map",
            "G2",
            "Yes — open licence",
          ],
          [
            "Coalition & consultation design",
            "Consultation record",
            "G4",
            "Yes",
          ],
        ],
      },
      {
        kind: "prose",
        heading: "Every instrument can be handed over.",
        body: [
          "We do not hold instruments hostage to future fees. Any tool we build on an engagement can be licensed to the client, and most are released under open terms for non-commercial use.",
        ],
      },
      {
        kind: "cta",
        title: "See the licensing terms.",
        body: "Instruments can be licensed, co-branded or transferred to a client academy.",
        actions: [
          {
            label: "Licensing & open terms",
            href: "/method/licensing",
            primary: true,
          },
          { label: "Atlas of domains", href: "/method/glossary" },
        ],
      },
    ],
  },
  {
    slug: "glossary",
    path: "/method/glossary",
    column: "Method",
    label: "Glossary of domains",
    eyebrow: "Method · Glossary",
    title: "Glossary of domains.",
    lede: "The vocabulary we work in, defined precisely enough that a client and a consultant mean the same thing. Terms are grouped by domain and updated as the field moves.",
    meta: "TerraMorph glossary of domains: precise definitions of the terms used across LED, policy, TVET and finance work.",
    tags: ["Glossary", "Definitions", "Reference"],
    updated: "March 2026",
    blocks: [
      {
        kind: "list",
        heading: "Terms & domains",
        aside:
          "A working glossary, not a dictionary — terms we actually use on engagements.",
        items: [
          {
            title: "Binding constraint",
            body: "The single factor that, if changed, unlocks the most value — distinct from a symptom or a wish-list item.",
            tag: "Diagnostic",
          },
          {
            title: "Lever",
            body: "The smallest well-placed force that moves the largest outcome; stated in capital, policy or know-how terms.",
            tag: "Method",
          },
          {
            title: "Local economic development (LED)",
            body: "Place-based growth pursued through the assets, firms and institutions already present in a geography.",
            tag: "LED",
          },
          {
            title: "Mandate note",
            body: "The signed statement fixing the question, client, decision and rules before any work begins.",
            tag: "Governance",
          },
          {
            title: "Employer-validated curriculum",
            body: "A training module co-signed by employers who commit to recognising its completion.",
            tag: "TVET",
          },
          {
            title: "First-loss tranche",
            body: "Capital that absorbs initial losses to make a facility investable for commercial lenders.",
            tag: "Finance",
          },
          {
            title: "Blended finance",
            body: "Structures combining concessional and commercial capital to fund development outcomes.",
            tag: "Finance",
          },
          {
            title: "Land-bank register",
            body: "A public record of sites and assets available for bankable use, used to shortlist investment.",
            tag: "Data",
          },
          {
            title: "Transfer kit",
            body: "The method, tools and trained people handed to a client so the engagement ends cleanly.",
            tag: "Delivery",
          },
          {
            title: "Leverage ratio",
            body: "Outcome value per unit of fee or public spending — our preferred efficiency measure.",
            tag: "Evaluation",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Why we define terms publicly.",
        body: [
          "Most project failures begin as a vocabulary failure — two parties using the same word for different things. A shared glossary is the cheapest risk control available.",
        ],
      },
      {
        kind: "cta",
        title: "Term you think we are missing?",
        body: "Tell us the term and where you have seen it mis-used. We review suggestions quarterly.",
        actions: [{ label: "Suggest a term", href: "/contact", primary: true }],
      },
    ],
  },
  {
    slug: "licensing",
    path: "/method/licensing",
    column: "Method",
    label: "Licensing & open terms",
    eyebrow: "Method · Licensing & open terms",
    title: "Licensing & open terms.",
    lede: "How our methods and tools may be used, by whom and at what price. Open where it helps the field; licensed where it protects a client’s investment.",
    meta: "TerraMorph licensing and open terms: open licences for method notes, commercial licensing for tools and curricula.",
    tags: ["Open licence", "Commercial", "CC BY"],
    updated: "April 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Licence tiers",
        items: [
          {
            kicker: "Open",
            title: "Tier A — Open licence",
            body: "Method notes, glossaries and templates freely usable with attribution under CC BY 4.0, for non-commercial work.",
            badge: "Free",
          },
          {
            kicker: "Commercial",
            title: "Tier B — Commercial licence",
            body: "Tools, curricula and datasets licensed for commercial use, with support and updates included.",
            badge: "Licensed",
          },
          {
            kicker: "Enterprise",
            title: "Tier C — Academy licence",
            body: "Full method transferred to a client academy, with train-the-trainer certification for its instructors.",
            badge: "By agreement",
          },
        ],
      },
      {
        kind: "table",
        heading: "Licence matrix",
        columns: ["Asset", "Tier A", "Tier B", "Tier C"],
        rows: [
          ["Method notes & glossaries", "Open (CC BY)", "Included", "Included"],
          ["Diagnostic toolkit", "Read-only", "Licensed", "Transferred"],
          [
            "Investment & land-bank maps",
            "Open data",
            "Licensed",
            "Transferred",
          ],
          ["Curricula & assessments", "—", "Licensed", "Transferred"],
          ["Certification framework", "—", "—", "Transferred"],
        ],
      },
      {
        kind: "prose",
        heading: 'What "open" means here.',
        body: [
          "Open assets can be reused by NGOs, universities and public bodies without payment, provided our authorship is attributed and the work is not resold.",
          "Commercial reuse — including by consultancies and vendors — requires a Tier B licence, which funds the maintenance of the tools.",
        ],
      },
      {
        kind: "links",
        heading: "Licence documents",
        items: [
          {
            label: "Open licence (CC BY 4.0) — summary",
            meta: "Human-readable terms",
            href: "/contact",
            badge: "PDF",
          },
          {
            label: "Commercial licence agreement",
            meta: "Template · v2.3",
            href: "/contact",
            badge: "DOCX",
          },
          {
            label: "Academy licence schedule",
            meta: "Pricing and scope",
            href: "/learning/academies",
          },
        ],
      },
      {
        kind: "cta",
        title: "License a tool or a method.",
        body: "Tell us the asset and the intended use, and we will propose the right tier.",
        actions: [
          { label: "Discuss licensing", href: "/contact", primary: true },
          { label: "Academy licensing", href: "/learning/academies" },
        ],
      },
    ],
  },

  // Knowledge
  {
    slug: "publications",
    path: "/knowledge/publications",
    column: "Knowledge",
    label: "Publications library",
    eyebrow: "Knowledge · Publications library",
    title: "The publications library.",
    lede: "Everything we have published — policy briefs, working papers, practice notes and toolkits. Each entry names its type, language and length, and most are free.",
    meta: "The TerraMorph publications library: policy briefs, working papers, practice notes and free toolkits.",
    tags: ["Library", "AR/EN", "Free & licensed"],
    updated: "September 2026",
    blocks: [
      {
        kind: "figure",
        alt: "A selection of TerraMorph publications, toolkits and working papers",
        eyebrow: "Knowledge · Open where it helps",
        title: "Policy briefs, working papers, practice notes and toolkits.",
        caption:
          "Each entry names its type, language and length — and the toolkits are free.",
        credit: "TerraMorph publications library",
      },
      {
        kind: "list",
        heading: "Selected publications",
        aside: "Full archive is searchable; free items download instantly.",
        items: [
          {
            title: "إصلاح مناخ الاستثمار على مستوى المحافظات",
            meta: "Policy brief · AR · Sep 2026 · 9 min",
            tag: "AR",
          },
          {
            title: "Leverage ratios in public–private TVET partnerships",
            meta: "Working paper · EN · Aug 2026 · 24 min",
            tag: "EN",
          },
          {
            title:
              "Writing a mandate note that survives a ministerial reshuffle",
            meta: "Practice note · EN · Jul 2026 · 6 min",
            tag: "EN",
          },
          {
            title: "Blended finance for smallholder cooperatives",
            meta: "Working paper · EN/AR · Jun 2026 · 18 min",
            tag: "Free",
          },
          {
            title: "LED diagnostic toolkit — open licence",
            meta: "Toolkit · AR/EN · PDF · 32 pp",
            tag: "Free",
          },
          {
            title: "Mandate note template",
            meta: "Toolkit · EN · DOCX · 4 pp",
            tag: "Free",
          },
        ],
      },
      {
        kind: "prose",
        heading: "How to read us.",
        body: [
          "Working papers are preliminary and invite challenge; policy briefs are short and decision-oriented; practice notes describe how we do the work; toolkits are ready to use.",
        ],
      },
      {
        kind: "cta",
        title: "Looking for something specific?",
        body: "Search the full library by type and language, or ask us directly.",
        actions: [
          {
            label: "Browse policy briefs",
            href: "/knowledge/policy-briefs",
            primary: true,
          },
          { label: "Data & index products", href: "/knowledge/data-products" },
        ],
      },
    ],
  },
  {
    slug: "practice-notes",
    path: "/knowledge/practice-notes",
    column: "Knowledge",
    label: "Practice & method notes",
    eyebrow: "Knowledge · Practice notes",
    title: "Practice & method notes.",
    lede: "Short, candid notes on how the work is actually done — the parts that rarely make it into a brochure, written for practitioners.",
    meta: "TerraMorph practice and method notes: candid, practical writing on how advisory work is really done.",
    tags: ["Practice", "Method", "Candid"],
    updated: "July 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Recent notes",
        items: [
          {
            kicker: "Governance",
            title: "Writing a mandate note that survives a reshuffle",
            body: "Why the client, not the ministry, must own the question — and how to word it so it outlives the signatory.",
            meta: "6 min read",
          },
          {
            kicker: "Diagnostics",
            title: "The list is not the diagnosis",
            body: "A field guide to resisting the ten-point problem statement and finding the one binding constraint.",
            meta: "9 min read",
          },
          {
            kicker: "Delivery",
            title: "Embedding without becoming staff",
            body: "How to sit inside a client institution and stay useful without blurring who is accountable.",
            meta: "7 min read",
          },
          {
            kicker: "Transfer",
            title: "Designing the exit at the start",
            body: "Why the transfer kit should be specified in G0, not assembled in G7.",
            meta: "5 min read",
          },
        ],
      },
      {
        kind: "quote",
        text: "A method note is what we would tell a colleague — not what we would tell a client.",
        attribution: "TerraMorph method team",
      },
      {
        kind: "prose",
        heading: "Written for practitioners.",
        body: [
          "These notes assume you already know the field. They focus on the judgement calls: what to do when the client disagrees, when the data contradicts the brief, and when the honest answer is to stop.",
        ],
      },
      {
        kind: "cta",
        title: "Get new notes as they publish.",
        body: "Practice and method notes are announced in the newsletter, roughly monthly.",
        actions: [
          { label: "Subscribe", href: "/join/newsletter", primary: true },
          {
            label: "Full publications library",
            href: "/knowledge/publications",
          },
        ],
      },
    ],
  },
  {
    slug: "policy-briefs",
    path: "/knowledge/policy-briefs",
    column: "Knowledge",
    label: "Policy briefs (AR/EN)",
    eyebrow: "Knowledge · Policy briefs",
    title: "Policy briefs, in Arabic and English.",
    lede: "Short, decision-oriented briefs published in both Arabic and English, each stating the problem, the options and a recommended course with its trade-offs.",
    meta: "TerraMorph policy briefs in Arabic and English: concise, option-based briefs for decision-makers.",
    tags: ["Policy", "AR/EN", "Decision-oriented"],
    updated: "September 2026",
    blocks: [
      {
        kind: "list",
        heading: "Published briefs",
        aside: "Each brief is ≤ 6 pages and available in both languages.",
        items: [
          {
            title: "إصلاح مناخ الاستثمار على مستوى المحافظات",
            meta: "Sep 2026 · 6 pp · AR / EN",
            body: "Devolution of investment approvals to governorate level: options and sequencing.",
            tag: "Investment",
          },
          {
            title: "Financing TVET without a permanent subsidy line",
            meta: "Jul 2026 · 5 pp · EN / AR",
            body: "Three funding models that tie training revenue to employer demand.",
            tag: "TVET",
          },
          {
            title: "Land-bank registers as an LED instrument",
            meta: "May 2026 · 6 pp · EN / AR",
            body: "How a public register of sites de-risks industrial-zone investment.",
            tag: "LED",
          },
          {
            title: "مؤشرات قياس الأثر المحلي في المحافظات",
            meta: "Mar 2026 · 5 pp · AR / EN",
            body: "A minimal, publishable indicator set for local development results.",
            tag: "Measurement",
          },
        ],
      },
      {
        kind: "prose",
        heading: "We state the trade-offs.",
        body: [
          "A brief that recommends without naming what it costs the reader is not a brief. Every recommendation here carries its fiscal, political and administrative trade-off in plain text.",
        ],
      },
      {
        kind: "cta",
        title: "Commission a brief.",
        body: "We write public-interest briefs for governments, donors and chambers on request.",
        actions: [
          { label: "Request a brief", href: "/contact", primary: true },
          { label: "Publications library", href: "/knowledge/publications" },
        ],
      },
    ],
  },
  {
    slug: "data-products",
    path: "/knowledge/data-products",
    column: "Knowledge",
    label: "Data & index products",
    eyebrow: "Knowledge · Data & index products",
    title: "Data & index products.",
    lede: "Open datasets and composite indices we maintain and update on a schedule — built to be cited, challenged and reused under an open licence.",
    meta: "TerraMorph data and index products: open datasets and composite indices with coverage and update schedules.",
    tags: ["Open data", "Indices", "CC BY"],
    updated: "August 2026",
    blocks: [
      {
        kind: "stats",
        items: [
          { value: "5", label: "Live datasets", note: "updated on schedule" },
          {
            value: "27",
            label: "Governorates covered",
            note: "indicator granularity",
          },
          {
            value: "2015",
            label: "Earliest series",
            note: "investment climate",
          },
          { value: "CC BY", label: "Licence", note: "4.0, open" },
        ],
      },
      {
        kind: "cards",
        heading: "Products",
        items: [
          {
            kicker: "Index",
            title: "Local Leverage Index",
            body: "A composite measure of how well a governorate converts spending into local outcomes.",
            badge: "Annual",
          },
          {
            kicker: "Dataset",
            title: "Investment Climate Tracker",
            body: "Approval times, fees and procedural steps for common investment permits by governorate.",
            badge: "Quarterly",
          },
          {
            kicker: "Dataset",
            title: "TVET Demand Register",
            body: "Employer-reported skills demand mapped to training supply by sector.",
            badge: "Bi-annual",
          },
          {
            kicker: "Map",
            title: "Land-bank Explorer",
            body: "Interactive map of public sites and assets available for bankable use.",
            badge: "Rolling",
          },
        ],
      },
      {
        kind: "table",
        heading: "Coverage & terms",
        columns: ["Product", "Coverage", "Update", "Licence"],
        rows: [
          ["Local Leverage Index", "27 governorates", "Annual", "CC BY 4.0"],
          [
            "Investment Climate Tracker",
            "12 governorates",
            "Quarterly",
            "CC BY 4.0",
          ],
          ["TVET Demand Register", "National", "Bi-annual", "CC BY 4.0"],
          ["Land-bank Explorer", "3 governorates", "Rolling", "Open data"],
        ],
      },
      {
        kind: "links",
        heading: "Access the data",
        items: [
          {
            label: "Local Leverage Index 2026",
            meta: "CSV + methodology · CC BY 4.0",
            href: "/contact",
            badge: "CSV",
          },
          {
            label: "Investment Climate Tracker",
            meta: "CSV · quarterly release",
            href: "/contact",
            badge: "CSV",
          },
          {
            label: "API documentation",
            meta: "REST · JSON · rate-limited free tier",
            href: "/contact",
            badge: "API",
          },
        ],
      },
      {
        kind: "cta",
        title: "Cite the data.",
        body: "Every product ships with a suggested citation and a DOI. Tell us how you use it — we track real-world use.",
        actions: [
          { label: "Ask about the data", href: "/contact", primary: true },
        ],
      },
    ],
  },
  {
    slug: "podcast",
    path: "/knowledge/podcast",
    column: "Knowledge",
    label: "Podcast + transcripts",
    eyebrow: "Knowledge · Podcast",
    title: "The Leverage Podcast.",
    lede: "Conversations with the people who move outcomes — officials, financiers, trainers and entrepreneurs. Every episode ships with a full transcript in Arabic and English.",
    meta: "The TerraMorph Leverage Podcast: conversations on development outcomes, with bilingual transcripts.",
    tags: ["Podcast", "Transcripts", "AR/EN"],
    updated: "August 2026",
    blocks: [
      {
        kind: "list",
        heading: "Episodes",
        aside: "New episodes fortnightly. Transcripts publish within 48 hours.",
        items: [
          {
            title: "Ep. 14 — Financing the last mile of TVET",
            meta: "Aug 2026 · 44 min · AR/EN",
            body: "A financier and a school director disagree, usefully, about who should pay for training.",
            tag: "Play",
          },
          {
            title: "Ep. 13 — The land-bank idea, ten years on",
            meta: "Aug 2026 · 38 min · EN",
            body: "What actually happened after a governorate published its sites.",
            tag: "Play",
          },
          {
            title: "Ep. 12 — Small firms, large outcomes",
            meta: "Jul 2026 · 41 min · AR/EN",
            body: "Why a small advisory firm can out-deliver a large one — and when it cannot.",
            tag: "Play",
          },
          {
            title: "Ep. 11 — Measuring what ministers actually decide",
            meta: "Jul 2026 · 36 min · EN",
            body: "On indicator sets that survive a change of government.",
            tag: "Play",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Why transcripts.",
        body: [
          "A podcast that only exists as audio excludes readers who rely on text and researchers who need to quote precisely. Transcripts are published in both languages, lightly edited for clarity.",
        ],
      },
      {
        kind: "links",
        heading: "Subscribe",
        items: [
          { label: "RSS feed", meta: "All episodes · audio", href: "/contact" },
          { label: "Apple Podcasts", meta: "Subscribe", href: "/contact" },
          {
            label: "Transcript archive",
            meta: "AR/EN · full text",
            href: "/contact",
          },
        ],
      },
      {
        kind: "cta",
        title: "Suggest a guest or a topic.",
        body: "We especially want listeners who disagree with us.",
        actions: [
          { label: "Suggest an episode", href: "/contact", primary: true },
        ],
      },
    ],
  },

  // Learning
  {
    slug: "catalogue",
    path: "/learning/catalogue",
    column: "Learning",
    label: "Course catalogue",
    eyebrow: "Learning · Course catalogue",
    title: "Course catalogue.",
    lede: 'Every programme we run, with its format, price and next date. No "contact us for details" — if it is listed, it is bookable.',
    meta: "TerraMorph course catalogue: practitioner programmes with formats, prices and next available dates.",
    tags: ["Courses", "Priced", "Bookable"],
    updated: "October 2026",
    blocks: [
      {
        kind: "calendar",
        heading: "Upcoming programmes",
        items: [
          {
            date: "12",
            month: "Nov",
            title: "Local economic development — practitioner course",
            format: "In person · Cairo · 3 days",
            status: "6 seats left",
            tone: "ok",
          },
          {
            date: "03",
            month: "Dec",
            title: "Train-the-trainer: the TerraMorph method",
            format: "Hybrid · 5 days · certification",
            status: "3 seats left",
            tone: "warn",
          },
          {
            date: "14",
            month: "Jan",
            title: "Tailored diagnostics for public institutions",
            format: "Online · 4 × 2 h",
            status: "Open",
            tone: "ok",
          },
          {
            date: "—",
            month: "Open",
            title: "Welcome method — onboarding for new teams",
            format: "Self-paced · AR/EN",
            status: "Free for NGOs",
            tone: "gold",
          },
        ],
      },
      {
        kind: "table",
        heading: "Prices & durations",
        columns: ["Programme", "Format", "Duration", "Price"],
        rows: [
          ["Local economic development", "In person", "3 days", "EGP 9,500"],
          ["Train-the-trainer", "Hybrid", "5 days", "EGP 18,000"],
          ["Tailored diagnostics", "Online", "4 × 2 h", "EGP 4,200"],
          ["Welcome method", "Self-paced", "2 h", "Free for NGOs"],
        ],
      },
      {
        kind: "prose",
        heading: "What every course includes.",
        body: [
          "A printed and digital workbook, the relevant open-licence toolkit, and a certificate of completion. Train-the-trainer additionally certifies you to deliver the module yourself.",
        ],
      },
      {
        kind: "cta",
        title: "Not sure which course fits?",
        body: "Tell us your role and what you need to be able to do afterwards.",
        actions: [
          { label: "Get a recommendation", href: "/contact", primary: true },
          { label: "See the full calendar", href: "/learning/calendar" },
        ],
      },
    ],
  },
  {
    slug: "calendar",
    path: "/learning/calendar",
    column: "Learning",
    label: "Open programmes calendar",
    eyebrow: "Learning · Open calendar",
    title: "Open programmes calendar.",
    lede: "Every open-enrolment date for the next two quarters, across Cairo, online and hybrid. Reserve a seat directly — no approval loop.",
    meta: "TerraMorph open programmes calendar: upcoming course dates, formats and seat availability.",
    tags: ["Calendar", "Enrolment", "Q4–Q1"],
    updated: "October 2026",
    blocks: [
      {
        kind: "calendar",
        heading: "Next three months",
        aside:
          "Seats are released on a rolling basis; wait-lists open when full.",
        items: [
          {
            date: "12",
            month: "Nov",
            title: "Local economic development — practitioner course",
            format: "In person · Cairo · 3 days",
            status: "6 seats left",
            tone: "ok",
          },
          {
            date: "21",
            month: "Nov",
            title: "Blended finance clinic",
            format: "Online · half day",
            status: "Open",
            tone: "ok",
          },
          {
            date: "03",
            month: "Dec",
            title: "Train-the-trainer: the TerraMorph method",
            format: "Hybrid · 5 days",
            status: "3 seats left",
            tone: "warn",
          },
          {
            date: "10",
            month: "Dec",
            title: "Reading a mandate: governance for public teams",
            format: "Online · 2 × 2 h",
            status: "Open",
            tone: "ok",
          },
          {
            date: "14",
            month: "Jan",
            title: "Tailored diagnostics for public institutions",
            format: "Online · 4 × 2 h",
            status: "Open",
            tone: "ok",
          },
          {
            date: "28",
            month: "Jan",
            title: "Data for local development",
            format: "In person · Alexandria · 2 days",
            status: "Wait-list",
            tone: "neutral",
          },
        ],
      },
      {
        kind: "stats",
        items: [
          { value: "9", label: "Open dates", note: "this quarter" },
          { value: "3", label: "Cities", note: "Cairo · Alexandria · online" },
          { value: "48h", label: "Typical fill", note: "for popular courses" },
          { value: "100%", label: "Money-back", note: "first session" },
        ],
      },
      {
        kind: "cta",
        title: "Get dates in your calendar.",
        body: "Subscribe to the open-programmes calendar feed and never miss a release.",
        actions: [
          {
            label: "Subscribe to the feed",
            href: "/join/newsletter",
            primary: true,
          },
          { label: "Browse the catalogue", href: "/learning/catalogue" },
        ],
      },
    ],
  },
  {
    slug: "train-the-trainer",
    path: "/learning/train-the-trainer",
    column: "Learning",
    label: "Train-the-trainer",
    eyebrow: "Learning · Train-the-trainer",
    title: "Train-the-trainer.",
    lede: "A five-day certification that transfers our method to your instructors, so the client can deliver the programme without us. The output is a certified trainer, not a certificate.",
    meta: "TerraMorph train-the-trainer certification: how instructors become certified to deliver our method.",
    tags: ["Certification", "Trainers", "Transfer"],
    updated: "September 2026",
    blocks: [
      {
        kind: "timeline",
        heading: "Certification path",
        items: [
          {
            step: "01",
            title: "Fundamentals",
            meta: "Day 1–2",
            body: "The LDIA architecture and G0–G7 lifecycle, taught as you will teach it.",
          },
          {
            step: "02",
            title: "Teach-back",
            meta: "Day 3",
            body: "Each candidate delivers a module to peers and is assessed against a rubric.",
          },
          {
            step: "03",
            title: "Supervised delivery",
            meta: "Day 4–5",
            body: "Candidates co-deliver a live session with a TerraMorph trainer present.",
          },
          {
            step: "04",
            title: "Certification",
            meta: "On completion",
            body: "Certified trainers are listed on the public register and licensed to deliver.",
          },
        ],
      },
      {
        kind: "cards",
        heading: "What you get",
        items: [
          {
            title: "Full slide & workbook set",
            body: "Editable source files for every module, under the academy licence.",
            badge: "Included",
          },
          {
            title: "Assessment pack",
            body: "Rubrics, exemplars and a question bank mapped to each learning outcome.",
            badge: "Included",
          },
          {
            title: "Public register listing",
            body: "Your name and specialty appear on the certified trainer register.",
            badge: "Listed",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Certification is renewed, not bought once.",
        body: [
          "Trainers re-certify every two years and must deliver at least one programme in between. The register reflects who is currently active.",
        ],
      },
      {
        kind: "cta",
        title: "Become a certified trainer.",
        body: "Next hybrid cohort opens 03 December. Three seats remain.",
        actions: [
          { label: "Apply for the cohort", href: "/contact", primary: true },
          { label: "See the register", href: "/learning/trainer-register" },
        ],
      },
    ],
  },
  {
    slug: "trainer-register",
    path: "/learning/trainer-register",
    column: "Learning",
    label: "Certified trainer register",
    eyebrow: "Learning · Trainer register",
    title: "Certified trainer register.",
    lede: "The public list of people currently certified to deliver our programmes, with their specialty and standing. If a trainer is not here, they are not certified.",
    meta: "The public register of TerraMorph certified trainers, with specialties and current standing.",
    tags: ["Register", "Public", "Verified"],
    updated: "October 2026",
    blocks: [
      {
        kind: "table",
        heading: "Certified trainers",
        aside:
          "Updated monthly. Standing reflects the latest re-certification cycle.",
        columns: ["Name", "Specialty", "Base", "Certified", "Standing"],
        rows: [
          [
            "Hala Nassar",
            "Local economic development",
            "Cairo",
            "2024",
            "Active",
          ],
          ["Omar Fahmy", "Blended finance", "Alexandria", "2025", "Active"],
          ["Rania Kamel", "TVET & curricula", "Assiut", "2024", "Active"],
          [
            "Youssef Adly",
            "Diagnostics & data",
            "Cairo",
            "2023",
            "Renewal due",
          ],
          ["Mona Serry", "Governance & mandate", "Luxor", "2025", "Active"],
        ],
      },
      {
        kind: "prose",
        heading: "How to verify a trainer.",
        body: [
          'Every listing shows a certification cycle year. A trainer marked "renewal due" is still certified but entering the re-certification window; a trainer absent from this register is not authorised to deliver our material.',
        ],
      },
      {
        kind: "cta",
        title: "Looking for a trainer near you?",
        body: "We can match you to an active certified trainer for in-house delivery.",
        actions: [
          { label: "Request a trainer", href: "/contact", primary: true },
          { label: "Get certified", href: "/learning/train-the-trainer" },
        ],
      },
    ],
  },
  {
    slug: "academies",
    path: "/learning/academies",
    column: "Learning",
    label: "Licensing for academies",
    eyebrow: "Learning · Academies",
    title: "Licensing for academies.",
    lede: "For universities and training institutions that want to deliver the TerraMorph method under their own brand — a full transfer, not a franchise.",
    meta: "TerraMorph academy licensing: transfer the full method to your institution with certified instructors.",
    tags: ["Academies", "Licence", "Transfer"],
    updated: "August 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Licence options",
        items: [
          {
            kicker: "Single programme",
            title: "Module licence",
            body: "License one programme, with materials and assessment packs updated annually.",
            badge: "From EGP 120k/yr",
          },
          {
            kicker: "Whole method",
            title: "Academy licence",
            body: "Transfer the full catalogue, certify up to eight of your instructors, and co-brand.",
            badge: "By agreement",
          },
          {
            kicker: "Public interest",
            title: "Public-body licence",
            body: "Discounted transfer for government training institutes and public universities.",
            badge: "Subsidised",
          },
        ],
      },
      {
        kind: "table",
        heading: "What the academy licence includes",
        columns: ["Component", "Module", "Academy", "Public body"],
        rows: [
          [
            "Programme materials",
            "One programme",
            "Full catalogue",
            "Full catalogue",
          ],
          ["Instructor certification", "2 places", "8 places", "8 places"],
          ["Annual updates", "Included", "Included", "Included"],
          ["Co-branding", "—", "Yes", "Yes"],
          ["Deliver independently", "Yes", "Yes", "Yes"],
        ],
      },
      {
        kind: "faq",
        heading: "Common questions",
        items: [
          {
            q: "Can we adapt the material to our context?",
            a: "Yes. The academy licence includes an adaptation right for your jurisdiction, provided the underlying architecture is preserved and TerraMorph is credited.",
          },
          {
            q: "What happens if an instructor leaves?",
            a: "Certification is personal, but you may re-certify a replacement at a reduced rate within the licence term.",
          },
          {
            q: "Do you compete with us?",
            a: "We do not run open programmes in your catchment during the licence term, to protect your enrolment.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Talk about an academy licence.",
        body: "Tell us your institution type and intended programmes, and we will scope a licence.",
        actions: [
          { label: "Scope a licence", href: "/contact", primary: true },
        ],
      },
    ],
  },

  // About
  {
    slug: "team",
    path: "/about/team",
    column: "About",
    label: "Founder & team",
    eyebrow: "About · Founder & team",
    title: "Founder & team.",
    lede: "Who does the work. A small, senior team — every engagement is delivered by the people named here, with no bench of unseen juniors.",
    meta: "Meet the TerraMorph founder and core team: the senior people who deliver every engagement.",
    tags: ["Team", "Senior", "Named"],
    updated: "September 2026",
    blocks: [
      {
        kind: "team",
        heading: "Core team",
        people: [
          {
            name: "Dr. Sherif El-Masry",
            role: "Founder & Managing Director",
            focus:
              "Local economic development and public investment. Twenty years advising governorates and ministries.",
          },
          {
            name: "Laila Hafez",
            role: "Director, Policy & Governance",
            focus:
              "Regulatory reform and public finance, with a habit of reading the actual statute.",
          },
          {
            name: "Karim Adly",
            role: "Director, Finance & Enterprise",
            focus:
              "Blended finance and SME structures; former development-finance officer.",
          },
          {
            name: "Nour Sami",
            role: "Head of Learning",
            focus:
              "Designs and runs the course catalogue and the train-the-trainer pipeline.",
          },
          {
            name: "Tarek Mansour",
            role: "Lead, Data & GIS",
            focus:
              "Turns registers and surveys into maps and indices practitioners actually use.",
          },
          {
            name: "Amina Hosny",
            role: "Head of Delivery",
            focus:
              "Keeps engagements on the G0–G7 gates and clients out of avoidable surprises.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "Small on purpose.",
        body: [
          "We stay deliberately small. A large firm bills you for a proposal team you never meet; we are small enough that the people who win the work are the people who deliver it — and accountable when it does not go to plan.",
        ],
      },
      {
        kind: "cta",
        title: "Work with this team.",
        body: "Every engagement is led by a named director from this page.",
        actions: [
          { label: "Start a conversation", href: "/contact", primary: true },
          { label: "Meet the associates", href: "/about/associates" },
        ],
      },
    ],
  },
  {
    slug: "associates",
    path: "/about/associates",
    column: "About",
    label: "Associates & experts",
    eyebrow: "About · Associates & experts",
    title: "Associates & experts.",
    lede: "A vetted network we draw on when an engagement needs a depth we do not keep in-house. Associates are named on every engagement they join.",
    meta: "TerraMorph associates and subject experts: a vetted network named on every engagement.",
    tags: ["Associates", "Experts", "Network"],
    updated: "August 2026",
    blocks: [
      {
        kind: "team",
        heading: "Selected associates",
        aside:
          "Each associate is engaged under the same compliance file as the core team.",
        people: [
          {
            name: "Prof. Hoda Rizk",
            role: "TVET & labour economics",
            focus: "University chair; authors our TVET demand register.",
          },
          {
            name: "Samir Gaber",
            role: "Industrial zones & land",
            focus:
              "Thirty years in industrial-zone development and site servicing.",
          },
          {
            name: "Dr. Yasmin Farouk",
            role: "Public health systems",
            focus: "Bridges development work into community health outcomes.",
          },
          {
            name: "Ihab Rami",
            role: "Financial modelling",
            focus: "Builds the models behind blended-finance structures.",
          },
          {
            name: "Dr. Layla Amr",
            role: "Gender & inclusion",
            focus: "Ensures inclusion is designed in, not appended.",
          },
          {
            name: "Mostafa Zaki",
            role: "Agri-value chains",
            focus: "Smallholder aggregation and off-take structuring.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "How the network works.",
        body: [
          "We do not broker CVs. Associates are engaged directly for the part of the work they own, their names appear in the deliverable, and they are paid on the same terms as the core team.",
          "Registration is open to experts year-round; acceptance is based on recent, evidenced delivery in a specific domain.",
        ],
      },
      {
        kind: "cta",
        title: "Join the expert network.",
        body: "Register once, see your status, and be matched to live assignments.",
        actions: [
          {
            label: "Register as an expert",
            href: "/join/experts",
            primary: true,
          },
          { label: "See open opportunities", href: "/join/opportunities" },
        ],
      },
    ],
  },
  {
    slug: "why-small",
    path: "/about/why-small",
    column: "About",
    label: "Why a small firm",
    eyebrow: "About · Why a small firm",
    title: "Why a small firm.",
    lede: "A deliberate choice, not a limitation. Small makes us faster, cheaper to mobilise and impossible to hide behind a hierarchy.",
    meta: "Why TerraMorph stays a small advisory firm: the trade-offs, the model and what it means for clients.",
    tags: ["Philosophy", "Model", "Accountable"],
    updated: "June 2026",
    blocks: [
      {
        kind: "figure",
        alt: "The TerraMorph core team working together in a small studio in New Cairo",
        eyebrow: "About · The model",
        title:
          "Small on purpose: the person who promises the work does the work.",
        caption:
          "A named founder, a core team of six, and a vetted bench behind them.",
        credit: "TerraMorph · New Cairo",
      },
      {
        kind: "prose",
        heading: "The case for staying small.",
        body: [
          "Large advisory firms price in overhead clients rarely benefit from: layers of management, proposal factories, and rotating staffing. We trade scale for accountability — the person who promises the work is the person who does it.",
          "Small also makes us faster. A mandate can be scoped in a week because there is no committee to convene, and a decision can be made in a call because the decision-makers are in the call.",
        ],
      },
      {
        kind: "stats",
        items: [
          { value: "6", label: "Core team", note: "no unseen bench" },
          {
            value: "1 wk",
            label: "Typical mobilisation",
            note: "scope to signed mandate",
          },
          { value: "94%", label: "Repeat or referred", note: "of client base" },
          {
            value: "0",
            label: "Commissioned proposals",
            note: "not written blind",
          },
        ],
      },
      {
        kind: "quote",
        text: "We would rather be the small firm that is checkable than the big one that is not.",
        attribution: "Dr. Sherif El-Masry, Founder",
      },
      {
        kind: "prose",
        heading: "And the honest limits.",
        body: [
          "Small means we do not chase work we cannot staff, and we will decline an engagement rather than stretch. It also means our network matters — which is exactly why our associates are named, not anonymous.",
        ],
      },
      {
        kind: "cta",
        title: "See if small fits your mandate.",
        body: "Bring the decision you need to make and we will tell you honestly whether we are the right size for it.",
        actions: [
          { label: "Start a conversation", href: "/contact", primary: true },
        ],
      },
    ],
  },
  {
    slug: "compliance",
    path: "/about/compliance",
    column: "About",
    label: "Compliance & policies",
    eyebrow: "About · Compliance & policies",
    title: "Compliance & policies.",
    lede: "The policies that govern how we work, how we handle data and how we handle conflicts. Published in full, because a policy you cannot read is not a policy.",
    meta: "TerraMorph compliance and policies: anti-bribery, data protection, safeguarding and conflict-of-interest, published in full.",
    tags: ["Compliance", "Policies", "Transparent"],
    updated: "June 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Published policies",
        items: [
          {
            kicker: "Integrity",
            title: "Anti-bribery & corruption",
            body: "Aligned to ISO 37001; governs gifts, hospitality, intermediaries and facilitation payments.",
            badge: "ISO 37001",
          },
          {
            kicker: "Data",
            title: "Data protection & privacy",
            body: "Covers client data, expert CVs and personal data under agency and privacy law.",
            badge: "Published",
          },
          {
            kicker: "People",
            title: "Safeguarding & conduct",
            body: "Zero tolerance of harassment, discrimination and abuse of position.",
            badge: "Published",
          },
          {
            kicker: "Conflicts",
            title: "Conflict of interest",
            body: "Declare, disclose and recuse — including prior employment by a client.",
            badge: "Published",
          },
        ],
      },
      {
        kind: "table",
        heading: "Policy register",
        columns: ["Policy", "Owner", "Review cycle", "Status"],
        rows: [
          [
            "Anti-bribery & corruption",
            "Compliance lead",
            "Annual",
            "In force",
          ],
          [
            "Data protection & privacy",
            "Data protection officer",
            "Annual",
            "In force",
          ],
          ["Safeguarding & conduct", "Managing Director", "Annual", "In force"],
          [
            "Conflict of interest",
            "Compliance lead",
            "Every 6 months",
            "In force",
          ],
          [
            "Supplier & associate due diligence",
            "Compliance lead",
            "Annual",
            "In force",
          ],
        ],
      },
      {
        kind: "links",
        heading: "Download policies",
        items: [
          {
            label: "Anti-bribery policy",
            meta: "PDF · AR/EN",
            href: "/contact",
            badge: "PDF",
          },
          {
            label: "Data protection policy",
            meta: "PDF · EN",
            href: "/contact",
            badge: "PDF",
          },
          {
            label: "Conflict-of-interest register",
            meta: "PDF · summary",
            href: "/contact",
            badge: "PDF",
          },
        ],
      },
      {
        kind: "cta",
        title: "Report a concern.",
        body: "We operate a confidential reporting channel for concerns about our conduct. Reports are reviewed by the compliance lead.",
        actions: [
          { label: "Report a concern", href: "/contact", primary: true },
          { label: "Contact & offices", href: "/about/contact" },
        ],
      },
    ],
  },
  {
    slug: "contact-offices",
    path: "/about/contact",
    column: "About",
    label: "Contact & offices",
    eyebrow: "About · Contact & offices",
    title: "Contact & offices.",
    lede: "Where we are and how to reach the right person directly. No general enquiry form that disappears into a void.",
    meta: "Contact TerraMorph: Cairo head office, regional presences, and direct contact for new engagements.",
    tags: ["Contact", "Offices", "Direct"],
    updated: "September 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Offices",
        items: [
          {
            kicker: "Head office",
            title: "New Cairo, Egypt",
            body: "TerraMorph Advisory LLC · CR No. 184 562 · the address for all formal correspondence and tenders.",
            meta: "Sun–Thu, 09:00–17:00 EET",
            badge: "HQ",
          },
          {
            kicker: "Regional",
            title: "Assiut",
            body: "Field presence for Upper Egypt delivery and governorate engagements.",
            meta: "By appointment",
            badge: "Field",
          },
          {
            kicker: "Regional",
            title: "Alexandria",
            body: "Delivery base for Delta and coastal engagements.",
            meta: "By appointment",
            badge: "Field",
          },
        ],
      },
      {
        kind: "links",
        heading: "Reach us directly",
        items: [
          {
            label: "hello@askterramorph.com",
            meta: "New engagements & general enquiries",
            href: "mailto:hello@askterramorph.com",
          },
          {
            label: "tenders@askterramorph.com",
            meta: "Procurement & tender documents",
            href: "mailto:tenders@askterramorph.com",
          },
          {
            label: "+20 115 000 0984",
            meta: "Switchboard · Sun–Thu, 09:00–17:00 EET",
            href: "tel:+201150000984",
          },
          {
            label: "linkedin.com/company/terramorph",
            meta: "Company updates",
            href: "https://www.linkedin.com/",
          },
        ],
      },
      {
        kind: "faq",
        heading: "Before you write",
        items: [
          {
            q: "How quickly do you reply?",
            a: "Within one working day. A named person, not an auto-responder.",
          },
          {
            q: "Can we send a tender or RFP?",
            a: "Yes — send it to tenders@ and we will confirm eligibility and any teaming options within two working days.",
          },
          {
            q: "Do you take unsolicited expert CVs?",
            a: "Please register through the expert network instead, so your CV enters the matching pool with a visible status.",
          },
        ],
      },
    ],
  },

  // Join
  {
    slug: "careers",
    path: "/join/careers",
    column: "Join",
    label: "Careers & vacancies",
    eyebrow: "Join · Careers",
    title: "Careers & vacancies.",
    lede: "Open roles, stated plainly with salary bands and who you would work with. We name our people, so you know exactly who you are joining.",
    meta: "TerraMorph careers: open vacancies with salary bands, teams and how we hire.",
    tags: ["Careers", "Open roles", "Named teams"],
    updated: "October 2026",
    blocks: [
      {
        kind: "list",
        heading: "Open roles",
        aside:
          "All roles list a salary band. We do not ask for current salary.",
        items: [
          {
            title: "Senior policy analyst",
            meta: "Cairo · Full time · EGP 22–30k/mo",
            body: "Owns regulatory and investment-climate briefs. Reports to the Director, Policy & Governance.",
            tag: "Open",
          },
          {
            title: "LED field coordinator",
            meta: "Assiut · 12 months · EGP 14–18k/mo",
            body: "Runs field delivery for governorate engagements in Upper Egypt.",
            tag: "Open",
          },
          {
            title: "Data analyst (GIS)",
            meta: "Cairo / hybrid · Full time · EGP 16–22k/mo",
            body: "Builds and maintains our land-bank maps and index products.",
            tag: "Open",
          },
          {
            title: "Learning associate",
            meta: "Cairo · Full time · EGP 13–17k/mo",
            body: "Supports the course catalogue and train-the-trainer cohorts.",
            tag: "Open",
          },
        ],
      },
      {
        kind: "prose",
        heading: "How we hire.",
        body: [
          "A shortlist call, a paid written task drawn from real (anonymised) work, and a conversation with the people you would actually work with. No unpaid day-long exercises, no panel of strangers.",
        ],
      },
      {
        kind: "cta",
        title: "See a role that fits?",
        body: "Apply with a CV and a short note on the piece of our work you would most want to redo differently.",
        actions: [
          { label: "Apply now", href: "/contact", primary: true },
          { label: "Internships with AAST", href: "/join/internships" },
        ],
      },
    ],
  },
  {
    slug: "experts",
    path: "/join/experts",
    column: "Join",
    label: "Expert network registration",
    eyebrow: "Join · Expert network",
    title: "Expert network registration.",
    lede: "Register once, see your status at every step, and be matched to live assignments. A registration with a visible outcome — never a dead-end CV upload.",
    meta: "Register for the TerraMorph expert network: a four-step process with a visible status at every stage.",
    tags: ["Experts", "Registration", "Matched"],
    updated: "September 2026",
    blocks: [
      {
        kind: "timeline",
        heading: "Registration, step by step",
        items: [
          {
            step: "01",
            title: "Profile",
            meta: "2 min",
            body: "Name, contact and location. We need an email before we need anything else.",
          },
          {
            step: "02",
            title: "Expertise",
            meta: "3 min",
            body: "Select the practice areas where you can evidence recent delivery.",
          },
          {
            step: "03",
            title: "CV",
            meta: "1 min",
            body: "Upload a CV in PDF or DOCX. It enters the matching pool immediately.",
          },
          {
            step: "04",
            title: "Status",
            meta: "~5 working days",
            body: "Under review, then matched to live assignments as they open.",
          },
        ],
      },
      {
        kind: "prose",
        heading: "What happens after you register.",
        body: [
          "Your registration is reviewed by the method team against current demand. Accepted experts are contacted when a matching assignment opens — we do not send your CV anywhere without asking you first.",
          "Fees are agreed per assignment, in writing, before any work begins.",
        ],
      },
      {
        kind: "cta",
        title: "Ready to register?",
        body: "The four-step form lives on the Join board — register in about six minutes.",
        actions: [
          { label: "Register as an expert", href: "/join", primary: true },
          { label: "See open opportunities", href: "/join/opportunities" },
        ],
      },
    ],
  },
  {
    slug: "opportunities",
    path: "/join/opportunities",
    column: "Join",
    label: "Expert opportunity board",
    eyebrow: "Join · Opportunity board",
    title: "Expert opportunity board.",
    lede: "Live assignments open to network experts, with sector, geography and the application window. Filter, then express interest once.",
    meta: "TerraMorph expert opportunity board: live assignments open to network experts.",
    tags: ["Opportunities", "Assignments", "Live"],
    updated: "October 2026",
    blocks: [
      {
        kind: "table",
        heading: "Live opportunities",
        aside:
          "Open to registered experts. Windows close at 17:00 EET on the stated date.",
        columns: ["Assignment", "Sector", "Country", "Window", "Status"],
        rows: [
          [
            "Urban mobility diagnostic",
            "Infrastructure",
            "Egypt",
            "Closes 30 Oct",
            "Open",
          ],
          [
            "TVET governance review",
            "TVET & skills",
            "Egypt",
            "Closes 14 Nov",
            "Open",
          ],
          ["SME finance access study", "Finance", "Jordan", "Rolling", "Open"],
          [
            "Agri value-chain assessment",
            "Agriculture",
            "Morocco",
            "Closes 21 Nov",
            "Open",
          ],
          [
            "Local leverage index update",
            "Data",
            "Egypt",
            "Closes 05 Dec",
            "Open",
          ],
        ],
      },
      {
        kind: "prose",
        heading: "How matching works.",
        body: [
          "When an assignment opens, the method team shortlists registered experts by evidenced domain and geography, then invites a subset to express interest. You are never added to a proposal without consent.",
        ],
      },
      {
        kind: "cta",
        title: "Not registered yet?",
        body: "You must be in the network to express interest in an assignment.",
        actions: [
          {
            label: "Register as an expert",
            href: "/join/experts",
            primary: true,
          },
          { label: "Read the opportunity FAQ", href: "/join" },
        ],
      },
    ],
  },
  {
    slug: "internships",
    path: "/join/internships",
    column: "Join",
    label: "Internships (AAST)",
    eyebrow: "Join · Internships",
    title: "Internships with AAST.",
    lede: "Paid, structured internships run with the Arab Academy for Science, Technology and Maritime Transport — real work, a named mentor and a published checklist to grow people.",
    meta: "TerraMorph internships with AAST: paid, structured placements with a named mentor and real deliverables.",
    tags: ["Internships", "AAST", "Paid"],
    updated: "September 2026",
    blocks: [
      {
        kind: "cards",
        heading: "Tracks",
        items: [
          {
            kicker: "Research",
            title: "Policy & evidence track",
            body: "Support a live brief: gather sources, test claims and draft sections under review.",
            meta: "Cairo · 6 months",
            badge: "3 places",
          },
          {
            kicker: "Data",
            title: "Data & GIS track",
            body: "Work on the land-bank register and index products with the data team.",
            meta: "Hybrid · 6 months",
            badge: "2 places",
          },
          {
            kicker: "Delivery",
            title: "Field delivery track",
            body: "Support governorate field work and consultation logistics in Upper Egypt.",
            meta: "Assiut · 4 months",
            badge: "2 places",
          },
        ],
      },
      {
        kind: "timeline",
        heading: "What the internship looks like",
        items: [
          {
            step: "01",
            title: "Onboarding",
            meta: "Week 1",
            body: "Read the method, meet your mentor, agree two deliverables.",
          },
          {
            step: "02",
            title: "Real work",
            meta: "Months 1–5",
            body: "Contribute to live engagements, with fortnightly reviews.",
          },
          {
            step: "03",
            title: "Showcase",
            meta: "Final month",
            body: "Present your work to the team; strong interns are considered for roles.",
          },
        ],
      },
      {
        kind: "faq",
        heading: "Eligibility",
        items: [
          {
            q: "Are internships paid?",
            a: "Yes. AAST internships carry a monthly stipend and cover travel for field placements.",
          },
          {
            q: "Do I need to be an AAST student?",
            a: "The AAST track is for AAST students and recent graduates; we also list a small number of open places for others via careers.",
          },
          {
            q: "Will I get a mentor?",
            a: "Every intern gets a named mentor from the core team and a written checklist of what they will learn.",
          },
        ],
      },
      {
        kind: "cta",
        title: "Apply for the AAST track.",
        body: "Applications are reviewed with AAST each quarter.",
        actions: [
          { label: "Apply now", href: "/contact", primary: true },
          { label: "See open roles", href: "/join/careers" },
        ],
      },
    ],
  },
  {
    slug: "newsletter",
    path: "/join/newsletter",
    column: "Join",
    label: "Newsletter archive",
    eyebrow: "Join · Newsletter",
    title: "The newsletter archive.",
    lede: "Our monthly note: what we published, what we learned and one thing we got wrong. Every past issue, readable in full.",
    meta: "The TerraMorph newsletter archive: monthly notes on new publications, method and open programmes.",
    tags: ["Newsletter", "Archive", "Monthly"],
    updated: "October 2026",
    blocks: [
      {
        kind: "list",
        heading: "Recent issues",
        aside: "One email a month. No tracking pixels, no upsell.",
        items: [
          {
            title: "Issue 34 — The cost of the list you did not need",
            meta: "Oct 2026",
            body: "Why a shorter problem statement is a faster mandate.",
            tag: "Read",
          },
          {
            title: "Issue 33 — What we changed after 58 assignments",
            meta: "Sep 2026",
            body: "Three method edits the ledger forced on us.",
            tag: "Read",
          },
          {
            title: "Issue 32 — Land banks, ten years in",
            meta: "Aug 2026",
            body: "The follow-up on our most-cited instrument.",
            tag: "Read",
          },
          {
            title: "Issue 31 — Training that survives the donor cycle",
            meta: "Jul 2026",
            body: "On financing TVET without a permanent subsidy line.",
            tag: "Read",
          },
        ],
      },
      {
        kind: "prose",
        heading: "A note you can unsubscribe from in one click.",
        body: [
          "We publish the list size and open rate in the footer of each issue, and we never sell or share subscriber data.",
        ],
      },
      {
        kind: "cta",
        title: "Subscribe.",
        body: "Join a small list of practitioners, officials and researchers. One email a month.",
        actions: [
          { label: "Subscribe", href: "/join", primary: true },
          {
            label: "Read the publications library",
            href: "/knowledge/publications",
          },
        ],
      },
    ],
  },
]

export const pageBySlug: Record<string, PageDef> = Object.fromEntries(
  PAGES.map((p) => [p.slug, p]),
)

const pathToSlug: Record<string, string> = Object.fromEntries(
  PAGES.map((p) => [p.path, p.slug]),
)

/* The `@slug` routes pass the URL's last segment (e.g. `/about/contact` →
   `contact`, `/method/ldia` → `ldia`), which is not always the page's slug
   (`contact-offices`, `ldia-architecture`). Without this alias the router
   resolved a valid prerendered URL to the DetailPage "Not found" state.
   Every path segment is unique across PAGES (verified), so aliasing is safe. */
const pageBySegment: Record<string, PageDef> = Object.fromEntries(
  PAGES.map((p) => [p.path.split("/").filter(Boolean).pop() ?? "", p]),
)

export function pageForPath(path: string): string | null {
  return pathToSlug[path] ?? null
}

/* Resolve a page from either its slug or the URL segment it is served under. */
export function resolvePage(key: string): PageDef | undefined {
  return pageBySlug[key] ?? pageBySegment[key]
}

/* One-line description for navigation surfaces (mega-menu, mobile list, search).
   Derived from the lede so it never drifts from the page's own copy. */
export function pageSummary(p: PageDef, max = 92): string {
  const first = p.lede.split(/(?<=\.)\s+/)[0] ?? p.lede
  if (first.length <= max) return first
  const cut = first.slice(0, max)
  const sp = cut.lastIndexOf(" ")
  return (sp > 40 ? cut.slice(0, sp) : cut).replace(/[.,;:]$/, "") + "…"
}

export function pathForPage(slug: string): string {
  return pageBySlug[slug]?.path ?? "/"
}

export function pagesInColumn(column: ColumnKey): PageDef[] {
  return PAGES.filter((p) => p.column === column)
}

export const labelPath: Record<string, string> = Object.fromEntries(
  PAGES.map((p) => [p.label, p.path]),
)
