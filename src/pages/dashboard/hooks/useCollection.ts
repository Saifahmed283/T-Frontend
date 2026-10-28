import { useCallback, useEffect, useState } from "react"
import { api, type ContentItem, type ContentStatus } from "@/lib/api"

const DEMO_ITEMS: Record<string, ContentItem[]> = {
  assignments: [
    {
      id: "demo-assign-1",
      kind: "Assignment",
      status: "PUBLISHED",
      slug: "cairo-transport-study",
      title: "Cairo transport infrastructure study",
      data: {
        title: { en: "Cairo transport infrastructure study", ar: "دراسة البنية التحتية للنقل في القاهرة" },
        client: "Cairo Governorate",
        sector: "Transport",
        year: 2026,
        role: "Lead consultant",
        geography: "Cairo, Egypt",
        sectorAr: "النقل",
        geographyAr: "القاهرة، مصر",
        size: "USD 250k–500k",
        description: { en: "Comprehensive review of public transport planning for Greater Cairo.", ar: "مراجعة شاملة للتخطيط للنقل العام في القاهرة الكبرى." },
        verification: "https://example.com/verification",
      },
      seo: null,
      assignmentId: null,
      sourceReference: "Ministry of Transport contract",
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: "demo-assign-2",
      kind: "Assignment",
      status: "REVIEW",
      slug: "alexandria-port-feasibility",
      title: "Alexandria port pre-feasibility",
      data: {
        title: { en: "Alexandria port pre-feasibility", ar: "دراسة الجدوى الأولية لميناء الإسكندرية" },
        client: "Port Authority",
        sector: "Logistics",
        year: 2026,
        role: "Supporting consultant",
        geography: "Alexandria, Egypt",
        sectorAr: "الخدمات اللوجستية",
        geographyAr: "الإسكندرية، مصر",
        size: "USD 100k–250k",
        description: { en: "Pre-feasibility study for port expansion.", ar: "دراسة جدوى أولية لتوسيع الميناء." },
        verification: null,
      },
      seo: null,
      assignmentId: null,
      sourceReference: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: null,
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  cases: [
    {
      id: "demo-case-1",
      kind: "Case Study",
      status: "PUBLISHED",
      slug: "main-street-assiut-pilot",
      title: "Main Street Assiut — living market pilot",
      data: {
        title: { en: "Main Street Assiut — living market pilot", ar: "الشارع الرئيسي بأسيوط — نموذج سوق حي" },
        client: "Assiut Municipality",
        sector: "Economic development",
        year: 2026,
        tag: "Local government",
        tagAr: "الحكومة المحلية",
        mandate: { en: "Redesign one street as a working model of local economic development.", ar: "إعادة تصميم شارع واحد ليصبح نموذجًا عمليًا للتنمية الاقتصادية المحلية." },
        constraint: { en: "Limited budget and tight 12-week timeline.", ar: "ميزانية محدودة وجدول زمني مدته 12 أسبوعًا." },
        whatWeDid: { en: "Vendor, municipality and resident co-design process over twelve weeks.", ar: "عملية تصميم مشترك بين الباعة والبلدية والسكان على مدى اثني عشر أسبوعًا." },
        whatChanged: { en: "Foot traffic increased 34%; vendor incomes rose 18%.", ar: "ازداد movimiento الأقدام بنسبة 34%؛ وارتفع دخل البائعين بنسبة 18%." },
        measurement: { en: "Baseline and endline surveys with 200 vendors.", ar: "استطلاعات خط الأساس وخط النهاية مع 200 بائع." },
        verification: "https://example.com/assiut-pilot",
      },
      seo: null,
      assignmentId: null,
      sourceReference: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      updatedAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: "demo-case-2",
      kind: "Case Study",
      status: "APPROVED",
      slug: "upper-egypt-agri-coop",
      title: "Upper Egypt agri-cooperative",
      data: {
        title: { en: "Upper Egypt agri-cooperative", ar: "التعاونية الزراعية بصعيد مصر" },
        client: "Women-led agri cooperative",
        sector: "Agriculture",
        year: 2025,
        tag: "Social enterprise",
        tagAr: "مؤسسة اجتماعية",
        mandate: { en: "Blended-finance structure for women-led agri cooperative.", ar: "هيكل تمويل مختلط لتعاونية زراعية تقودها نساء." },
        whatWeDid: { en: "Structured blended finance and linked to offtake markets.", ar: "هيكلة تمويل مختلط وربط بأسواق التصريف." },
        verification: null,
      },
      seo: null,
      assignmentId: null,
      sourceReference: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: null,
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  publications: [
    {
      id: "demo-pub-1",
      kind: "Publication",
      status: "PUBLISHED",
      slug: "led-diagnostic-toolkit",
      title: "LED diagnostic toolkit — open licence",
      data: {
        title: { en: "LED diagnostic toolkit — open licence", ar: "حزمة تشخيص التنمية الاقتصادية المحلية — رخصة مفتوحة" },
        description: { en: "Practical toolkit for local economic development diagnostics.", ar: "حزمة أدوات عملية للتشخيصات التنموية الاقتصادية المحلية." },
        author: "TerraMorph Advisory",
        publicationDate: "2026-09-01",
        contentType: "Toolkit",
        contentTypeAr: "حزمة أدوات",
        language: "AR/EN",
        meta: "PDF · 32 pp · Sep 2026",
        metaAr: "PDF · 32 ص · سبتمبر 2026",
        free: "true",
        sector: "Economic development",
        geography: "Egypt",
        reference: "https://example.com/toolkit",
        citation: "TerraMorph (2026). LED Diagnostic Toolkit.",
        bibtex: "@misc{terramorph2026led, title={LED diagnostic toolkit}, author={TerraMorph Advisory}, year={2026}}",
        license: "CC BY 4.0",
        tags: "LED, diagnostic, toolkit, open licence",
      },
      seo: null,
      assignmentId: null,
      sourceReference: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  instruments: [
    {
      id: "demo-instr-1",
      kind: "Instrument",
      status: "APPROVED",
      slug: "binding-constraint-diagnostic",
      title: "Binding constraint diagnostic",
      data: {
        title: { en: "Binding constraint diagnostic", ar: "التشخيص المقيد" },
        description: { en: "Framework for identifying binding constraints to growth.", ar: "إطار لتحديد القيود المقيدة للنمو." },
        domain: "G2",
        stage: "G2",
        whatItIs: { en: "Diagnostic framework for binding constraints.", ar: "إطار تشخيصي للقيود المقيدة." },
        whenToUse: { en: "Early-stage programme design.", ar: "المراحل المبكرة من تصميم البرامج." },
        produces: { en: "Constraint prioritisation matrix.", ar: "مصفوفة أولوية القيود." },
        license: "CC BY 4.0",
        citation: "TerraMorph (2026). Binding constraint diagnostic.",
        bibtex: "@misc{terramorph2026bcd, title={Binding constraint diagnostic}, author={TerraMorph Advisory}, year={2026}}",
        usedBy: "Ministry of Planning",
      },
      seo: null,
      assignmentId: null,
      sourceReference: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      publishedAt: null,
      createdById: "u-1",
      updatedById: "u-1",
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
}

export function useCollection(collectionId: string) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ContentStatus | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.contentList(collectionId, {
        status,
        search,
        page,
        pageSize: 20,
      })
      /* Fall back to demo items when the backend returns empty results so the
         workspace looks populated during live demos. */
      const demoItems = DEMO_ITEMS[collectionId] ?? []
      const fetched = res.items.length > 0 ? res.items : demoItems
      setItems(fetched)
      setTotalPages(res.pagination.totalPages)
    } catch {
      setError("Failed to load items")
      const demoItems = DEMO_ITEMS[collectionId] ?? []
      setItems(demoItems)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [collectionId, status, search, page])

  useEffect(() => {
    void load()
  }, [load])

  return {
    items,
    loading,
    error,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    reload: load,
    setItems,
  }
}
