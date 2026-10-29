import type { SubmissionKind } from "@/lib/api"

/*
 * Audience hub content.
 *
 * Each audience gets its OWN answers, evidence, process and FAQ — not the same
 * template with a swapped title. This is the source the Hub renderer reads so
 * /hub/governments and /hub/business never say the same thing.
 */

export type HubStat = {
  value: string

  label: string

  note?: string
}

export type HubOffer = {
  title: string

  body: string

  meta?: string
}

export type HubProof = {
  title: string

  meta: string

  href: string
}

export type HubStep = {
  step: string

  title: string

  body: string
}

export type HubFaq = {
  q: string

  a: string
}

export type Hub = {
  slug: string

  ar: string

  label: string

  short: string

  kicker: string

  line: string

  intro: string

  meta: string

  figure: {
    alt: string

    eyebrow: string

    title: string

    caption: string
  }

  stats: HubStat[]

  offersHeading: string

  offersAside?: string

  offers: HubOffer[]

  proofHeading: string

  proofAside?: string

  proof: HubProof[]

  stepsHeading: string

  steps: HubStep[]

  faq: HubFaq[]

  cta: {
    label: string

    kind?: SubmissionKind

    title?: string

    intro?: string

    href?: string
  }

  secondary?: {
    label: string

    href: string
  }
}

export const hubs: Hub[] = [
  // Governments

  {
    slug: "governments",

    ar: "للحكومات",

    label: "For governments",

    short: "public institutions",

    kicker: "Public sector",

    line: "Mandate-mapped work that lives inside your rules.",

    intro:
      "Governorates, ministries and public authorities hire us for one reason: we do the work inside your procurement framework, with your own planners in the room, and hand back something your institution can defend.",

    meta: "TerraMorph works with governorates, ministries and public authorities in Egypt — mandate-mapped, procurement-ready, and delivered inside the client’s own rules.",

    figure: {
      alt: "A governorate investment map drafted with the authority’s own planning team",

      eyebrow: "Public sector · 2025",

      title:
        "A governorate investment map, drafted with the authority’s own planners.",

      caption:
        "Assiut Governorate · phase I–II · EGP 1.2bn mapped to three industrial zones.",
    },

    stats: [
      {
        value: "21",

        label: "Public engagements",

        note: "governorates, ministries, authorities",
      },

      {
        value: "9",

        label: "Governorates reached",

        note: "Upper Egypt to the Delta",
      },

      { value: "100%", label: "Mandate notes", note: "before any work starts" },

      { value: "11", label: "Policies improved", note: "adopted or in force" },
    ],

    offersHeading: "What we do for public institutions.",

    offersAside:
      "Every instrument is chosen to fit the constraint — and can be handed to your team.",

    offers: [
      {
        title: "Investment & land-bank mapping",

        body: "We place bankable uses on a public register of sites and assets, so investment lands where the services already are.",

        meta: "G2",
      },

      {
        title: "Regulatory burden review",

        body: "We measure the real cost of rules on firms and rank removals by effect per unit of effort.",

        meta: "G2–G3",
      },

      {
        title: "Local economic development strategy",

        body: "A place-based plan built from the assets, firms and institutions your governorate already has.",

        meta: "G1–G3",
      },

      {
        title: "Embedded delivery support",

        body: "We sit inside the authority and report monthly against agreed indicators until the capability transfers.",

        meta: "G5–G7",
      },
    ],

    proofHeading: "Assignments a procurement reader can check.",

    proofAside: "Named, dated, and verifiable against case studies.",

    proof: [
      {
        title: "Governorate investment map, phase I–II",

        meta: "Assiut Governorate · 2025 · USD 100–250k",

        href: "/evidence/case-studies",
      },

      {
        title: "Investment climate action plan",

        meta: "Ministry of Planning · 2026 · USD 250–500k",

        href: "/evidence/case-studies",
      },

      {
        title: "SME regulatory burden review",

        meta: "Chamber of commerce · Jordan · 2024",

        href: "/evidence/case-studies",
      },
    ],

    stepsHeading: "How a public engagement runs.",

    steps: [
      {
        step: "G0",

        title: "Signed mandate note",

        body: "We fix the question, the client and the decision it serves — in writing, before any work.",
      },

      {
        step: "G1",

        title: "Binding-constraint diagnostic",

        body: "We read the ground as it is and name the one constraint worth moving. If there is none, we say so.",
      },

      {
        step: "G4",

        title: "Recorded consultation",

        body: "Ministries, partners and private actors are consulted on the record; objections are answered in writing.",
      },

      {
        step: "G7",

        title: "Transfer to your team",

        body: "Method, tools and trained staff are handed over. Success is your institution not needing us.",
      },
    ],

    faq: [
      {
        q: "Can you work inside our procurement rules?",

        a: "Yes. Engagements are scoped to fit your tender thresholds and we supply the compliance pack — registrations, tax ID and insurer confirmations — with every bid.",
      },

      {
        q: "Have you done this in Egypt?",

        a: "Twenty-one public engagements across nine governorates, from investment maps in Assiut to a national investment-climate action plan.",
      },

      {
        q: "What will it cost us to find out?",

        a: "The G1 diagnostic is fixed-price and scoped up front. If the diagnostic finds no binding constraint, the engagement ends there.",
      },
    ],

    cta: {
      label: "Download the procurement pack",

      kind: "PUBLICATION_REQUEST",

      title: "Download the procurement pack",

      intro:
        "We will email the procurement pack and the compliance summary, mapped to standard eligibility fields.",
    },

    secondary: {
      label: "See the case studies",

      href: "/evidence/case-studies",
    },
  },

  // Development partners

  {
    slug: "development-partners",

    ar: "لشركاء التنمية",

    label: "For development partners",

    short: "programmes and donors",

    kicker: "Donor-funded delivery",

    line: "Registered, framework-eligible, and backed by a full ledger.",

    intro:
      "Programmes and donors need a delivery partner they can verify, not a brochure. We publish our registration identifiers, framework eligibility and the whole assignment ledger — then deliver with the evidence trail the audit will ask for.",

    meta: "TerraMorph supports donor-funded programmes with registered, framework-eligible delivery and a full, verifiable assignment ledger.",

    figure: {
      alt: "Re-tooling fourteen technical schools around employer-validated curricula",

      eyebrow: "TVET reform · 2024",

      title:
        "Re-tooling 14 technical schools around employer-validated curricula.",

      caption:
        "GIZ programme · graduation-into-job within 90 days rose from 21% to 48%.",
    },

    stats: [
      {
        value: "16",

        label: "Partner engagements",

        note: "donor-funded programmes",
      },

      {
        value: "ISO 37001",

        label: "Anti-bribery certified",

        note: "all engagements in scope",
      },

      { value: "58", label: "Ledger entries", note: "dated and named" },

      { value: "94%", label: "Repeat or referred", note: "of client base" },
    ],

    offersHeading: "Where we add value on a programme.",

    offersAside:
      "Delivery, measurement and capability transfer — under your results framework.",

    offers: [
      {
        title: "Programme design & feasibility",

        body: "We structure interventions against a clear theory of change, with costed options and a risk register per option.",

        meta: "Design",
      },

      {
        title: "TVET & skills systems",

        body: "Employer-validated curricula, trainer certification and financing models that survive the donor cycle.",

        meta: "Skills",
      },

      {
        title: "Monitoring, evaluation & verification",

        body: "Indicators fixed at baseline, verified against source, and reported whether or not they were met.",

        meta: "M&E",
      },

      {
        title: "Team augmentation under framework",

        body: "Specialist associates drop into your delivery team under the same compliance file and reporting rhythm.",

        meta: "Delivery",
      },
    ],

    proofHeading: "The evidence trail behind every claim.",

    proofAside:
      "Audit-ready: registrations, certificates, ledger and published results.",

    proof: [
      {
        title: "Employer-validated curricula for 14 schools",

        meta: "GIZ programme · Egypt · 2024",

        href: "/evidence/case-studies",
      },

      {
        title: "Regional logistics corridor pre-feasibility",

        meta: "Development partner · Morocco · 2023",

        href: "/evidence/case-studies",
      },

      {
        title: "Impact Report 2026 — verified indicators",

        meta: "Annual · open data",

        href: "/evidence/impact-report",
      },
    ],

    stepsHeading: "From due diligence to verified results.",

    steps: [
      {
        step: "01",

        title: "Due-diligence pack",

        body: "Registration identifiers, ISO certificates, tax and insurer confirmations — on request within one working day.",
      },

      {
        step: "02",

        title: "Capability statement",

        body: "A filterable statement mapping our evidenced domains to your results framework.",
      },

      {
        step: "03",

        title: "Teaming or contract",

        body: "We contract directly or as a named sub-partner, with named CVs for every key position.",
      },

      {
        step: "04",

        title: "Delivery & verification",

        body: "Monthly dashboards against agreed indicators, then verified results published with method.",
      },
    ],

    faq: [
      {
        q: "Are you registered and eligible?",

        a: "Yes — Egyptian commercial registration CR 184 562, tax ID 742-118-903, and ISO 37001/27001/9001 certification. We confirm framework eligibility per call.",
      },

      {
        q: "Where is the evidence?",

        a: "The full assignment ledger is published, dated and named, and the annual impact report ships with its underlying dataset.",
      },

      {
        q: "Who exactly delivers?",

        a: "A named core-team director leads every engagement; associates who join are named in the deliverable and engaged under the same compliance file.",
      },
    ],

    cta: {
      label: "Request the capability statement",

      kind: "PUBLICATION_REQUEST",

      title: "Request the capability statement",

      intro:
        "Includes registration identifiers, framework eligibility and a ledger extract.",
    },

    secondary: {
      label: "See certifications & compliance",

      href: "/evidence/certifications",
    },
  },

  // Business

  {
    slug: "business",

    ar: "للأعمال",

    label: "For business",

    short: "enterprises and investors",

    kicker: "Private sector",

    line: "A price-bearing diagnostic and a bookable date — not a sales call.",

    intro:
      "Enterprises and investors do not need another pitch deck. Book a fixed-price diagnostic with a real date, get costed options with their risks, and decide with the numbers in front of you.",

    meta: "TerraMorph for business: a price-bearing diagnostic with a bookable date, costed options and a clear decision — no sales call.",

    figure: {
      alt: "Structuring blended finance for a women-led agri-processing cooperative",

      eyebrow: "Social enterprise · 2026",

      title: "Blended finance for a women-led agri-processing cooperative.",

      caption:
        "Delta Impact Fund · a first-loss tranche unlocked a matching commercial facility.",
    },

    stats: [
      {
        value: "EGP 1.2bn",

        label: "Capital moved",

        note: "into three industrial zones",
      },

      { value: "0.7", label: "Leverage per EGP fee", note: "portfolio median" },

      { value: "2 days", label: "Reply time", note: "with a bookable date" },

      {
        value: "11",

        label: "Business engagements",

        note: "enterprises & investors",
      },
    ],

    offersHeading: "What you can buy from us.",

    offersAside:
      "Each engagement is priced up front and ends in a decision, not a document.",

    offers: [
      {
        title: "Investment & growth diagnostic",

        body: "A fixed-price read of the ground: where the value is, what is blocking it, and the one move worth making first.",

        meta: "Fixed price",
      },

      {
        title: "Market & feasibility study",

        body: "Sizing, demand evidence and a costed entry plan — with the assumptions exposed so you can challenge them.",

        meta: "Study",
      },

      {
        title: "Blended-finance structuring",

        body: "We design the tranches that make a project investable, and introduce the capital that fits.",

        meta: "Finance",
      },

      {
        title: "Growth & expansion strategy",

        body: "A sequenced plan with owners, cost and risk — sized to what you can actually execute.",

        meta: "Strategy",
      },
    ],

    proofHeading: "Outcomes you can check.",

    proofAside: "Each one names the client, the year and the number.",

    proof: [
      {
        title: "Governorate investment map moved EGP 1.2bn",

        meta: "Assiut Governorate · 2025",

        href: "/evidence/case-studies",
      },

      {
        title: "Blended finance for an agri cooperative",

        meta: "Delta Impact Fund · 2026",

        href: "/evidence/case-studies",
      },

      {
        title: "SME regulatory burden review",

        meta: "Chamber of commerce · 2024",

        href: "/evidence/case-studies",
      },
    ],

    stepsHeading: "How working with us feels.",

    steps: [
      {
        step: "01",

        title: "Book a date",

        body: "Tell us the decision in front of you; we return a scope, a fixed price and a start date — usually within two working days.",
      },

      {
        step: "02",

        title: "Diagnose",

        body: "We read the market, the numbers and the constraint. No mystery, no retained-deck theatre.",
      },

      {
        step: "03",

        title: "Costed options",

        body: "You get options with costs, owners, sequencing and a risk register for each — never a single unexamined recommendation.",
      },

      {
        step: "04",

        title: "Decide",

        body: "The engagement ends in a decision you understand. You keep the method and the model.",
      },
    ],

    faq: [
      {
        q: "What does it cost?",

        a: "The diagnostic is fixed-price and scoped before we start. You will never be asked to fund an open-ended discovery phase.",
      },

      {
        q: "When can you start?",

        a: "We can usually mobilise within one week; the diagnostic itself runs two to four weeks depending on data access.",
      },

      {
        q: "What do we get at the end?",

        a: "A binding-constraint diagnostic, costed options with risk registers, and the model and method in a form your team can reuse.",
      },
    ],

    cta: {
      label: "Book the diagnostic",

      kind: "SEAT_RESERVATION",

      title: "Book the diagnostic",

      intro:
        "A price-bearing diagnostic with a bookable date — not a sales call.",
    },

    secondary: {
      label: "See how the work is structured",

      href: "/method/ldia",
    },
  },

  // NGOs

  {
    slug: "ngos",

    ar: "للمنظمات غير الحكومية",

    label: "For NGOs",

    short: "civil society",

    kicker: "Civil society",

    line: "Free method notes, open-licence tools, and a model that fits a small budget.",

    intro:
      "NGOs and social enterprises get the same method we sell to governments — the notes, the templates and the tools are open. Start free, build capacity in your own team, and pay only if and when you need us embedded.",

    meta: "TerraMorph for NGOs and social enterprises: free open-licence method notes, templates and a scaled engagement model for small budgets.",

    figure: {
      alt: "Field work with a women-led cooperative in the Delta",

      eyebrow: "Capacity building · Delta",

      title: "Capacity built in your team stays in your team.",

      caption:
        "Open method notes, templates and tools under a CC BY 4.0 licence.",
    },

    stats: [
      {
        value: "CC BY 4.0",

        label: "Open-licence tools",

        note: "free for non-commercial use",
      },

      {
        value: "2",

        label: "Free toolkits",

        note: "diagnostic toolkit + mandate template",
      },

      {
        value: "In-house",

        label: "Capacity by design",

        note: "not dependency",
      },

      {
        value: "Scaled",

        label: "Engagement model",

        note: "sized to a small budget",
      },
    ],

    offersHeading: "What is available, free or scaled.",

    offersAside:
      "Open where it helps the field; small and affordable where you need hands.",

    offers: [
      {
        title: "Open method notes & templates",

        body: "Practice notes, the LED diagnostic toolkit and the mandate-note template — free under CC BY 4.0.",

        meta: "Free",
      },

      {
        title: "Capacity-building partnership",

        body: "We work alongside your team so the skill stays with you, with a written checklist of what you will be able to do alone.",

        meta: "Capacity",
      },

      {
        title: "Programme evaluation",

        body: "An honest read of what your programme changed, against a baseline you publish, whether or not it worked.",

        meta: "Evaluation",
      },

      {
        title: "Scaled engagement model",

        body: "A shortened version of our method scoped to a small budget and a single binding constraint.",

        meta: "Scaled",
      },
    ],

    proofHeading: "Tools and work you can use today.",

    proofAside: "No paywall on the method.",

    proof: [
      {
        title: "LED diagnostic toolkit — open licence",

        meta: "PDF · 32 pp · free",

        href: "/knowledge/publications",
      },

      {
        title: "Practice & method notes",

        meta: "Free, candid writing for practitioners",

        href: "/knowledge/practice-notes",
      },

      {
        title: "Blended finance for an agri cooperative",

        meta: "Delta Impact Fund · 2026",

        href: "/evidence/case-studies",
      },
    ],

    stepsHeading: "How to start with almost nothing.",

    steps: [
      {
        step: "01",

        title: "Start free",

        body: "Download the method notes and toolkit. No email wall on the open assets.",
      },

      {
        step: "02",

        title: "Name one constraint",

        body: "Use the diagnostic to isolate the single constraint worth moving in your context.",
      },

      {
        step: "03",

        title: "Build capacity",

        body: "Bring us in alongside your team for the part you cannot yet do alone.",
      },

      {
        step: "04",

        title: "Transfer",

        body: "We leave you the tool, the trained staff and the checklist — then step out.",
      },
    ],

    faq: [
      {
        q: "What is actually free?",

        a: "Method notes, the LED diagnostic toolkit and the mandate-note template are free under a CC BY 4.0 licence — reuse them with attribution for non-commercial work.",
      },

      {
        q: "Can you fit a small budget?",

        a: "Yes. The scaled model takes one binding constraint and a short window; it is priced to what a small organisation can actually fund.",
      },

      {
        q: "Will you build our capacity?",

        a: "That is the point. Every engagement carries a written checklist of what your team will be able to do alone by the end.",
      },
    ],

    cta: {
      label: "Get the free toolkit",

      kind: "PUBLICATION_REQUEST",

      title: "Get the free toolkit",

      intro: "Free method notes and open-licence tools, emailed directly.",
    },

    secondary: {
      label: "Browse the publications library",

      href: "/knowledge/publications",
    },
  },

  // Consultancies

  {
    slug: "consultancies",

    ar: "للاستشاريين",

    label: "For consultancies",

    short: "primes and consultancies",

    kicker: "Teaming",

    line: "A specialist sub-partner with method, local reach and a clean compliance file.",

    intro:
      "Primes and consultancies team with us when a bid needs a specialist who is registered, compliant and actually on the ground. We bring the method, the local network and a compliance file that clears due diligence.",

    meta: "TerraMorph teams with primes and consultancies: specialist sub-partnership, a vetted expert bench and a clean, verifiable compliance file.",

    figure: {
      alt: "The TerraMorph compliance file: ISO certificates and registration identifiers",

      eyebrow: "Teaming · Compliance",

      title: "A compliance file that clears due diligence first time.",

      caption:
        "ISO 37001, ISO/IEC 27001, ISO 9001 · CR 184 562 · tax ID 742-118-903.",
    },

    stats: [
      { value: "ISO 37001", label: "Anti-bribery", note: "plus 27001 & 9001" },

      {
        value: "214",

        label: "Experts on roster",

        note: "named CVs on request",
      },

      { value: "9", label: "Countries", note: "MENA & EU reach" },

      {
        value: "Named",

        label: "CVs, not placeholders",

        note: "every key position",
      },
    ],

    offersHeading: "What we bring to a bid.",

    offersAside:
      "The specialist piece, the local reach and the paperwork — ready to drop into your submission.",

    offers: [
      {
        title: "Specialist sub-partnership",

        body: "LED, policy, TVET and investment-climate lots, delivered as a named sub-partner under your prime contract.",

        meta: "Teaming",
      },

      {
        title: "Expert bench & named CVs",

        body: "A vetted bench of 214 specialists with CVs you can put in the proposal — not anonymised placeholders.",

        meta: "Bench",
      },

      {
        title: "Compliance file",

        body: "Registrations, ISO certificates, tax and insurer confirmations, and a conflict-of-interest register.",

        meta: "Compliance",
      },

      {
        title: "Joint methodology",

        body: "We align our LDIA/G0–G7 method to your delivery framework so the joint offer reads as one.",

        meta: "Method",
      },
    ],

    proofHeading: "What a prime can verify before teaming.",

    proofAside: "Everything a due-diligence team asks for, in one place.",

    proof: [
      {
        title: "Compliance pack 2026",

        meta: "Registrations, tax ID, insurers",

        href: "/evidence/certifications",
      },

      {
        title: "Certifications register",

        meta: "ISO 37001 · 27001 · 9001",

        href: "/evidence/certifications",
      },

      {
        title: "Associates & expert network",

        meta: "Vetted, named, in scope",

        href: "/about/associates",
      },
    ],

    stepsHeading: "How teaming works.",

    steps: [
      {
        step: "01",

        title: "NDA & scoping",

        body: "A short call and a mutual NDA, then we agree the lots and the split of scope.",
      },

      {
        step: "02",

        title: "Capability statement",

        body: "A version of our statement tailored to the bid, with named CVs for the specialist positions.",
      },

      {
        step: "03",

        title: "Teaming agreement",

        body: "Clear roles, clear accountability, and a compliance file attached for your due diligence.",
      },

      {
        step: "04",

        title: "Joint delivery",

        body: "We deliver our piece under your reporting rhythm, and hand over to you as prime.",
      },
    ],

    faq: [
      {
        q: "What do you bring to a bid?",

        a: "Deep specialty in LED, policy, TVET and investment climate, plus local reach and a method that already passes procurement scrutiny.",
      },

      {
        q: "Are you compliant?",

        a: "ISO 37001 (anti-bribery), ISO/IEC 27001 (information security) and ISO 9001 (quality), with a published policy register.",
      },

      {
        q: "Who signs the CVs?",

        a: "Our experts do — named and contactable, engaged under the same compliance file, never anonymised placeholders.",
      },
    ],

    cta: {
      label: "Propose a teaming arrangement",

      kind: "TEAM_PROPOSAL",

      title: "Propose a teaming arrangement",

      intro:
        "We bring method, local reach and a clean compliance file to a joint bid.",
    },

    secondary: {
      label: "See the compliance file",

      href: "/evidence/certifications",
    },
  },

  // Careers

  {
    slug: "careers",

    ar: "الوظائف",

    label: "Careers",

    short: "people who join us",

    kicker: "Join the team",

    line: "Open roles with salary bands and named teams.",

    intro:
      "We name our people, so you know exactly who you would be joining. Every role lists a salary band, and the people who interview you are the people you would work with.",

    meta: "Careers at TerraMorph: open roles with published salary bands, named teams and a hiring process you can see.",

    figure: {
      alt: "The TerraMorph core team at work in New Cairo",

      eyebrow: "The team · New Cairo",

      title: "A named founder, a core team, and a vetted bench behind them.",

      caption:
        "We stay small on purpose — the person who promises the work does the work.",
    },

    stats: [
      { value: "4", label: "Open roles", note: "all with salary bands" },

      { value: "6", label: "Core team", note: "no unseen bench" },

      {
        value: "1 wk",

        label: "Typical mobilisation",

        note: "scope to signed mandate",
      },

      {
        value: "AAST",

        label: "Internship partner",

        note: "paid, mentored, structured",
      },
    ],

    offersHeading: "Roles open right now.",

    offersAside:
      "All roles list a salary band. We do not ask for your current salary.",

    offers: [
      {
        title: "Senior policy analyst",

        body: "Owns regulatory and investment-climate briefs. Reports to the Director, Policy & Governance.",

        meta: "Cairo · Full time · EGP 22–30k/mo",
      },

      {
        title: "LED field coordinator",

        body: "Runs field delivery for governorate engagements in Upper Egypt.",

        meta: "Assiut · 12 months · EGP 14–18k/mo",
      },

      {
        title: "Data analyst (GIS)",

        body: "Builds and maintains our land-bank maps and index products.",

        meta: "Cairo / hybrid · EGP 16–22k/mo",
      },

      {
        title: "Learning associate",

        body: "Supports the course catalogue and train-the-trainer cohorts.",

        meta: "Cairo · Full time · EGP 13–17k/mo",
      },
    ],

    proofHeading: "Read this before you apply.",

    proofAside: "We would rather you self-select well than interview badly.",

    proof: [
      {
        title: "Why a small firm",

        meta: "The trade-offs, stated honestly",

        href: "/about/why-small",
      },

      {
        title: "Founder & team",

        meta: "Who you would actually work with",

        href: "/about/team",
      },

      {
        title: "Internships with AAST",

        meta: "Paid, structured, mentored",

        href: "/join/internships",
      },
    ],

    stepsHeading: "How we hire.",

    steps: [
      {
        step: "01",

        title: "Shortlist call",

        body: "A conversation, not a screening script — usually within one week of applying.",
      },

      {
        step: "02",

        title: "Paid written task",

        body: "A short exercise drawn from real, anonymised work. We pay for your time.",
      },

      {
        step: "03",

        title: "Meet the team",

        body: "A conversation with the people you would actually work with. No panel of strangers.",
      },

      {
        step: "04",

        title: "Offer",

        body: "A clear offer with the salary band and the named team you would join.",
      },
    ],

    faq: [
      {
        q: "What roles are open?",

        a: "A senior policy analyst, an LED field coordinator, a GIS data analyst and a learning associate — each with a published salary band.",
      },

      {
        q: "How do you grow people?",

        a: "Named mentors, real deliverables, and a published checklist of what you will be able to do. Our internships work the same way.",
      },

      {
        q: "Who would I work with?",

        a: "A named director and the core team on every engagement. We publish who we are, so you are never surprised on day one.",
      },
    ],

    cta: { label: "See all open roles", href: "/join/careers" },

    secondary: { label: "Explore internships", href: "/join/internships" },
  },

  // Expert network

  {
    slug: "experts",

    ar: "شبكة الخبراء",

    label: "Expert network",

    short: "registered experts",

    kicker: "Expert network",

    line: "Register once, see your status, and be matched to live assignments.",

    intro:
      "The expert network is how specialists join our work. Register once, watch your status move, and get matched to live assignments — never a dead-end CV upload.",

    meta: "Register for the TerraMorph expert network: a visible status at every step and matching to live assignments.",

    figure: {
      alt: "The TerraMorph vetted expert network across seven domains",

      eyebrow: "Expert network · 214 on roster",

      title:
        "Seven domains, one matching pool, a visible status at every step.",

      caption: "Registration reviewed against live demand by the method team.",
    },

    stats: [
      { value: "214", label: "Experts on roster", note: "vetted by domain" },

      { value: "7", label: "Practice areas", note: "LED to public finance" },

      { value: "~5 days", label: "Review time", note: "with a visible status" },

      { value: "5", label: "Live opportunities", note: "open on the board" },
    ],

    offersHeading: "What registration gets you.",

    offersAside: "A registration with an outcome — not a CV that disappears.",

    offers: [
      {
        title: "A visible status",

        body: "See exactly where your registration is: profile, expertise, CV, then under review — no black box.",

        meta: "Step 1–4",
      },

      {
        title: "Domain matching",

        body: "The method team shortlists by evidenced domain and geography, and only asks when there is a genuine fit.",

        meta: "Matching",
      },

      {
        title: "The opportunity board",

        body: "Live assignments open to the network, with sector, geography and the application window.",

        meta: "Live board",
      },

      {
        title: "Onboarding with the method",

        body: "Accepted experts onboard with the TerraMorph welcome method, so you start already oriented.",

        meta: "Onboarding",
      },
    ],

    proofHeading: "What happens after you register.",

    proofAside: "No dead ends, and no CV ever sent without your consent.",

    proof: [
      {
        title: "Expert opportunity board",

        meta: "Live assignments, open now",

        href: "/join/opportunities",
      },

      {
        title: "Associates & experts",

        meta: "How the network is engaged",

        href: "/about/associates",
      },

      {
        title: "Registration, step by step",

        meta: "The four-step process",

        href: "/join/experts",
      },
    ],

    stepsHeading: "Registration, step by step.",

    steps: [
      {
        step: "01",

        title: "Profile",

        body: "Name, contact and location. About two minutes.",
      },

      {
        step: "02",

        title: "Expertise",

        body: "Select the practice areas where you can evidence recent delivery.",
      },

      {
        step: "03",

        title: "CV",

        body: "Upload a CV in PDF or DOCX. It enters the matching pool immediately.",
      },

      {
        step: "04",

        title: "Status",

        body: "Under review, then matched to live assignments as they open.",
      },
    ],

    faq: [
      {
        q: "What happens after I register?",

        a: "Your registration is reviewed by the method team against current demand — about five working days — and you see the status move at each step.",
      },

      {
        q: "How are experts matched?",

        a: "By evidenced domain and geography. We contact you when there is a genuine fit; your CV is never shared without your consent.",
      },

      {
        q: "How are fees set?",

        a: "Fees are agreed per assignment, in writing, before any work begins — the same terms as the core team.",
      },
    ],

    cta: { label: "Register as an expert", href: "/join" },

    secondary: {
      label: "See the opportunity board",

      href: "/join/opportunities",
    },
  },
]

export const hubBySlug: Record<string, Hub> = Object.fromEntries(
  hubs.map((h) => [h.slug, h]),
)
