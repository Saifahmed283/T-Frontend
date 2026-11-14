import { usePageContext } from "vike-react/usePageContext"
import { useData } from "vike-react/useData"
import { pageForPath, pageBySlug, columnMeta } from "@/content/pages"
import { hubBySlug } from "@/content/hubs"
import { SECTION_PATHS } from "@/lib/routes"
import { SECTION_TITLES, type DetailMeta } from "@/content/publicRoutes"

const BRAND = "TerraMorph"
const ORIGIN = "https://askterramorph.com"
const ORG_ID = `${ORIGIN}/#organization`
const SITE_ID = `${ORIGIN}/#website`
const LOCAL_ID = `${ORIGIN}/#local-business`
const OG_IMAGE = `${ORIGIN}/og-image.png`
const LINKEDIN = "https://www.linkedin.com/company/terramorph"

const SECTIONS: Record<string, {
  title: string
  description: string
}> = {
  "/": {
    title: "TerraMorph — Strategy, Policy & Transformation Advisory | Egypt",
    description:
      "TerraMorph advises governments, institutions and social enterprises in Egypt and across borders on strategy, policy and transformation — with named, dated engagements behind every claim.",
  },
  "/for": {
    title: "Who we serve | TerraMorph",
    description:
      "Government ministries, development partners, businesses, NGOs and consultants — how TerraMorph works with each, and what each engagement leaves behind.",
  },
  "/evidence": {
    title: "Evidence | TerraMorph",
    description:
      "Named, dated case studies, impact reporting and client references behind every TerraMorph claim.",
  },
  "/method": {
    title: "Method | TerraMorph",
    description:
      "How TerraMorph works: local diagnosis, the assignment lifecycle, the instruments we use, and a shared glossary of practice.",
  },
  "/knowledge": {
    title: "Knowledge | TerraMorph",
    description:
      "Publications, practice notes, policy briefs, data products and the TerraMorph podcast — the practice turned into public work.",
  },
  "/learning": {
    title: "Learning | TerraMorph",
    description:
      "Courses, academies and the train-the-trainer programme that build durable local capability instead of one-off delivery.",
  },
  "/about": {
    title: "About | TerraMorph",
    description:
      "Who we are: a deliberately small core team with a bench of associates, working to a documented compliance standard.",
  },
  "/join": {
    title: "Join | TerraMorph",
    description:
      "Careers, the expert register, opportunities, internships and our newsletter — ways to work with TerraMorph.",
  },
  "/contact": {
    title: "Contact | TerraMorph",
    description:
      "Start a conversation with TerraMorph — request a proposal, ask a question, or send a payment link to a client.",
  },
  "/legal": {
    title: "Legal & Compliance | TerraMorph",
    description:
      "TerraMorph legal policies: Privacy Policy, Terms of Service, Cookie Policy, and sub-processor list.",
  },
  "/legal/privacy-policy": {
    title: "Privacy Policy | TerraMorph",
    description:
      "How we collect, use, and protect your personal data under Egypt PDPL and international standards.",
  },
  "/legal/terms-of-service": {
    title: "Terms of Service | TerraMorph",
    description:
      "Terms governing use of our website, client portal, and advisory services.",
  },
  "/legal/cookie-policy": {
    title: "Cookie Policy | TerraMorph",
    description:
      "How we use cookies and similar technologies, and how to manage your preferences.",
  },
  "/dashboard": {
    title: "Dashboard | TerraMorph",
    description: "The TerraMorph client portal and content workspace.",
  },
  "/dashboard/login": {
    title: "Sign in | TerraMorph",
    description: "Sign in to your TerraMorph content workspace.",
  },
  "/reset-password": {
    title: "Reset password | TerraMorph",
    description: "Choose a new password for your TerraMorph account.",
  },
}

type Resolved = {
  title: string
  description: string
  trail?: {
    name: string
    path: string
  }[]
  noindex?: boolean
  localBusiness?: boolean
}

function stripBrand(title: string): string {
  return title.replace(/\s*\|\s*TerraMorph.*$/, "").trim()
}

function resolve(pathname: string): Resolved {
  const path = pathname.replace(/\/+$/, "") || "/"
  if (path === "/dashboard" || path === "/reset-password")
    return { ...SECTIONS[path], noindex: true }

  const section = SECTIONS[path]
  if (section)
    return {
      ...section,
      trail:
        path === "/" ? undefined : [{ name: stripBrand(section.title), path }],
      localBusiness: path === "/" || path === "/contact",
    }

  const slug = pageForPath(path)
  if (slug) {
    const page = pageBySlug[slug]
    if (page) {
      const sectionPath = SECTION_PATHS[columnMeta[page.column].section]
      const sectionTitle = stripBrand(
        SECTIONS[sectionPath]?.title ?? page.column,
      )
      return {
        title: `${page.label} | ${BRAND}`,
        description: page.meta,
        trail: [
          { name: sectionTitle, path: sectionPath },
          { name: page.label, path },
        ],
      }
    }
  }

  if (path.startsWith("/hub/")) {
    const hub = hubBySlug[path.slice(5)]
    if (hub)
      return {
        title: `${hub.label} | ${BRAND}`,
        description: hub.meta,
        trail: [
          { name: "Who we serve", path: "/for" },
          { name: hub.label, path },
        ],
      }
  }

  return {
    title: `Page not found | ${BRAND}`,
    description:
      "This TerraMorph page does not exist. Find evidence, knowledge and audience hubs from here.",
    noindex: true,
  }
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@id": ORG_ID,
    "@type": "Organization",
    name: "TerraMorph",
    legalName: "TerraMorph Advisory LLC",
    url: `${ORIGIN}/`,
    logo: `${ORIGIN}/favicon.svg`,
    email: "hello@askterramorph.com",
    telephone: "+201150000984",
    sameAs: [LINKEDIN],
    knowsLanguage: ["ar", "en"],
    identifier: [
      {
        "@type": "PropertyValue",
        propertyID: "Commercial Registration",
        value: "CR No. 184 562",
      },
      {
        "@type": "PropertyValue",
        propertyID: "Tax Identification Number",
        value: "742-118-903",
      },
    ],
  }
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@id": SITE_ID,
    "@type": "WebSite",
    name: BRAND,
    url: `${ORIGIN}/`,
    inLanguage: ["en", "ar"],
    publisher: { "@id": ORG_ID },
  }
}

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@id": LOCAL_ID,
    "@type": "LocalBusiness",
    additionalType: "https://schema.org/ProfessionalService",
    name: "TerraMorph Advisory LLC",
    description:
      "Strategy, policy and transformation advisory for governments, institutions and social enterprises in Egypt and across the region.",
    url: `${ORIGIN}/`,
    image: OG_IMAGE,
    logo: `${ORIGIN}/favicon.svg`,
    email: "hello@askterramorph.com",
    telephone: "+201150000984",
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Cairo",
      addressRegion: "Cairo",
      addressCountry: "EG",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "AdministrativeArea", name: "Middle East and North Africa" },
    ],
    sameAs: [LINKEDIN],
  }
}

function breadcrumbJsonLd(
  trail: {
    name: string
    path: string
  }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: BRAND, item: `${ORIGIN}/` },
      ...trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: `${ORIGIN}${crumb.path}`,
      })),
    ],
  }
}

export default function Head() {
  const pageContext = usePageContext()
  const { urlPathname, is404 } = pageContext
  /* `useData()` returns `undefined` on routes without a `+data.ts` (for
     example the home page), so guard against `undefined` before destructuring. */
  const detail = useData<{ detail: DetailMeta | null }>()?.detail
  const base = resolve(urlPathname)

  /* CMS detail pages (partners, vacancies, cases, publications, …) resolve to
     "Page not found" in `resolve()` because they aren't static routes; the CMS
     meta loaded by `+data.ts` wins so they get a real title, description and
     breadcrumb instead of `noindex`. */
  let { title, description, trail, noindex, localBusiness } = base
  const cmsDetail = detail && detail.title && !is404

  if (cmsDetail) {
    title = `${detail.title} | ${BRAND}`
    description = detail.description ?? base.description
    trail = [
      {
        name: stripBrand(SECTION_TITLES[detail.sectionPath] ?? detail.section),
        path: detail.sectionPath,
      },
      { name: detail.title, path: detail.path },
    ]
    noindex = false
  }
  const canonical = `${ORIGIN}${urlPathname === "/" ? "/" : urlPathname}`

  const jsonLd: Record<string, unknown>[] = []
  if (is404 || noindex) {
    // no structured data on noindex pages
  } else {
    jsonLd.push(organizationJsonLd())
    if (urlPathname === "/") jsonLd.push(websiteJsonLd())
    if (localBusiness) jsonLd.push(localBusinessJsonLd())
    if (trail) jsonLd.push(breadcrumbJsonLd(trail))
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex || is404 ? (
        <meta name="robots" content="noindex, follow" />
      ) : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
