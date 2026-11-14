export const audiences = [
  {
    slug: "governments",
    label: "For governments",
    ar: "للحكومات",
    line: "Governorates, ministries and authorities — mandate-mapped work inside your rules.",
    lineAr: "محافظات ووزارات وهيئات — عمل موثّق بالتكليف داخل قواعدكم.",
    action: "Download the procurement pack",
    actionAr: "حمّل حزمة المشتريات",
    q: [
      "Can you work inside our rules?",
      "Have you done this in Egypt?",
      "What will it cost us to find out?",
    ],
    qAr: [
      "هل تعملون داخل قواعدنا؟",
      "هل نفّذتم ذلك في مصر؟",
      "كم يكلفنا أن نعرف؟",
    ],
  },
  {
    slug: "development-partners",
    label: "For development partners",
    ar: "لشركاء التنمية",
    line: "Registration identifiers, framework eligibility and a full evidence trail.",
    lineAr: "معرّفات التسجيل وأهلية الأُطر وسجل أدلة كامل.",
    action: "Request the capability statement",
    actionAr: "اطلب بيان القدرات",
    q: [
      "Are you registered and eligible?",
      "Where is the evidence?",
      "Who exactly delivers?",
    ],
    qAr: ["هل أنتم مسجّلون ومؤهلون؟", "أين الأدلة؟", "من الذي ينفّذ بالضبط؟"],
  },
  {
    slug: "business",
    label: "For business",
    ar: "للأعمال",
    line: "A price-bearing diagnostic and a bookable date — not a sales call.",
    lineAr: "تشخيص معلن السعر وموعد قابل للحجز — لا مكالمة بيع.",
    action: "Book the diagnostic",
    actionAr: "احجز التشخيص",
    q: [
      "What does it cost?",
      "When can you start?",
      "What do we get at the end?",
    ],
    qAr: [
      "كم تبلغ التكلفة؟",
      "متى يمكنكم البدء؟",
      "ماذا نحصل عليه في النهاية؟",
    ],
  },
  {
    slug: "ngos",
    label: "For NGOs",
    ar: "للمنظمات غير الحكومية",
    line: "Free method notes, open-licence tools and a scaled-down engagement model.",
    lineAr: "ملاحظات منهجية مجانية وأدوات برخصة مفتوحة ونموذج تعاون مصغّر.",
    action: "Get the free toolkit",
    actionAr: "احصل على الأداة المجانية",
    q: [
      "What is free?",
      "Can you fit a small budget?",
      "Will you build our capacity?",
    ],
    qAr: ["ما المجاني؟", "هل تناسبكم ميزانية صغيرة؟", "هل ستبنون قدراتنا؟"],
  },
  {
    slug: "consultancies",
    label: "For consultancies",
    ar: "للاستشاريين",
    line: "A specialist sub-partner with method, local reach and clean compliance.",
    lineAr:
      "شريك متخصص من الباطن يقدّم المنهج والانتشار المحلي والامتثال النظيف.",
    action: "Propose a teaming arrangement",
    actionAr: "اقترح شراكة تنفيذية",
    q: [
      "What do you bring to a bid?",
      "Are you compliant?",
      "Who signs the CVs?",
    ],
    qAr: [
      "ماذا تقدّمون في المناقصة؟",
      "هل أنتم ممتثلون؟",
      "من يوقّع السير الذاتية؟",
    ],
  },
  {
    slug: "careers",
    label: "Careers",
    ar: "الوظائف",
    line: "Vacancies, internships with AAST, and a firm that names its people.",
    lineAr: "وظائف وتدريبات مع الأكاديمية العربية، وشركة تُسمّي أفرادها.",
    action: "See open roles",
    actionAr: "اطّلع على الوظائف المتاحة",
    q: [
      "What roles are open?",
      "How do you grow people?",
      "Who would I work with?",
    ],
    qAr: ["ما الوظائف المتاحة؟", "كيف تنمّون الكفاءات؟", "مع من سأعمل؟"],
  },
  {
    slug: "experts",
    label: "Expert network",
    ar: "شبكة الخبراء",
    line: "Register once, see your status, and be matched to live opportunities.",
    lineAr: "سجّل مرة واحدة، تابع حالتك، وطابِق فرصًا قائمة.",
    action: "Register as an expert",
    actionAr: "سجّل كخبير",
    q: [
      "What happens after I register?",
      "How are experts matched?",
      "How are fees set?",
    ],
    qAr: ["ماذا يحدث بعد التسجيل؟", "كيف يُطابق الخبراء؟", "كيف تُحدّد الأتعاب؟"],
  },
]

export const method = [
  {
    step: "01",
    name: "Mandate",
    time: "1–2 wks",
    body: "Fix the question, the client, the decision it serves and the rules it must live inside. Nothing starts without a signed mandate note.",
    out: "Mandate note",
  },
  {
    step: "02",
    name: "Diagnose",
    time: "2–4 wks",
    body: "Read the ground as it is: institutions, incentives, data. A diagnostic that names the binding constraint, not a list of everything.",
    out: "Binding-constraint diagnostic",
  },
  {
    step: "03",
    name: "Locate the lever",
    time: "1–2 wks",
    body: "Find the smallest well-placed force that moves the largest outcome — capital, policy or know-how, where it compounds.",
    out: "Lever map",
  },
  {
    step: "04",
    name: "Design",
    time: "3–6 wks",
    body: "Instrument design with costed options, owners and sequencing. Each option carries its own risk register.",
    out: "Instrument design",
  },
  {
    step: "05",
    name: "Align",
    time: "2–4 wks",
    body: "Build the coalition: ministries, partners, private actors. Consultation recorded, objections answered in writing.",
    out: "Consultation record",
  },
  {
    step: "06",
    name: "Deliver",
    time: "Variable",
    body: "Implementation support embedded in the client institution, with monthly dashboards against the agreed indicators.",
    out: "Delivery dashboard",
  },
  {
    step: "07",
    name: "Measure",
    time: "Quarterly",
    body: "Verify outcomes against baseline. Results published with method, so they can be checked by anyone.",
    out: "Verified results note",
  },
  {
    step: "08",
    name: "Transfer",
    time: "4–8 wks",
    body: "Hand over method, tools and trained people. The engagement is successful when the client no longer needs us.",
    out: "Transfer kit & certified trainers",
  },
]

export const cases = [
  {
    sector: "Local economic development",
    sectorAr: "التنمية الاقتصادية المحلية",
    year: "2025",
    title:
      "A governorate investment map that moved EGP 1.2bn into three industrial zones",
    titleAr:
      "خريطة استثمارية لمحافظة نقلت 1.2 مليار جنيه إلى ثلاث مناطق صناعية",
    client: "Governorate authority · Upper Egypt",
    clientAr: "جهة محافظة · صعيد مصر",
    tag: "Public sector",
    tagAr: "القطاع العام",
  },
  {
    sector: "TVET reform",
    sectorAr: "إصلاح التعليم الفني",
    year: "2024",
    title:
      "Re-tooling 14 technical schools around employer-validated curricula",
    titleAr: "تأهيل 14 مدرسة فنية وفق مناهج معتمدة من أصحاب العمل",
    client: "Development partner programme",
    clientAr: "برنامج شريك تنمية",
    tag: "Development partners",
    tagAr: "شركاء التنمية",
  },
  {
    sector: "Social enterprise",
    sectorAr: "المشروعات الاجتماعية",
    year: "2026",
    title:
      "Blended-finance structure for a women-led agri-processing cooperative",
    titleAr: "هيكل تمويل مختلط لتعاونية زراعية تقودها نساء",
    client: "Impact fund · Delta region",
    clientAr: "صندوق أثر · منطقة الدلتا",
    tag: "NGOs",
    tagAr: "المنظمات غير الحكومية",
  },
]

export const knowledge = [
  {
    type: "Policy brief",
    typeAr: "موجز سياسات",
    lang: "AR",
    title: "إصلاح مناخ الاستثمار على مستوى المحافظات",
    titleAr: "إصلاح مناخ الاستثمار على مستوى المحافظات",
    meta: "Sep 2026 · 9 min",
    metaAr: "سبتمبر 2026 · 9 د",
  },
  {
    type: "Working paper",
    typeAr: "ورقة عمل",
    lang: "EN",
    title: "Leverage ratios in public–private TVET partnerships",
    titleAr: "نسب الرافعة في شراكات التعليم الفني بين القطاعين العام والخاص",
    meta: "Aug 2026 · 24 min",
    metaAr: "أغسطس 2026 · 24 د",
  },
  {
    type: "Practice note",
    typeAr: "ملاحظة تطبيقية",
    lang: "EN",
    title: "Writing a mandate note that survives a ministerial reshuffle",
    titleAr: "كيف تكتب مذكرة تفويض تصمد أمام تغيير وزاري",
    meta: "Jul 2026 · 6 min",
    metaAr: "يوليو 2026 · 6 د",
  },
  {
    type: "Podcast",
    typeAr: "بودكاست",
    lang: "AR/EN",
    title: "Ep. 12 — Small firms, large outcomes",
    titleAr: "الحلقة 12 — شركات صغيرة، نتائج كبيرة",
    meta: "Jul 2026 · 41 min",
    metaAr: "يوليو 2026 · 41 د",
  },
]

export const footer: Record<string, string[]> = {
  Evidence: [
    "Case studies",
    "Impact report (annual)",
    "Clients & references",
    "Certifications",
  ],
  Method: [
    "The LDIA architecture",
    "Instruments",
    "Glossary of domains",
    "Licensing & open terms",
  ],
  Knowledge: [
    "Publications library",
    "Practice & method notes",
    "Policy briefs (AR/EN)",
    "Data & index products",
    "Podcast + transcripts",
  ],
  Learning: [
    "Course catalogue",
    "Open programmes calendar",
    "Train-the-trainer",
    "Certified trainer register",
    "Licensing for academies",
  ],
  About: [
    "Founder & team",
    "Associates & experts",
    "Why a small firm",
    "Compliance & policies",
    "Contact & offices",
  ],
  Join: [
    "Careers & vacancies",
    "Expert network registration",
    "Expert opportunity board",
    "Internships (AAST)",
    "Newsletter archive",
  ],
}

export const footerHeadingAr: Record<string, string> = {
  Evidence: "الأدلة",
  Method: "المنهج",
  Knowledge: "المعرفة",
  Learning: "التعلّم",
  About: "من نحن",
  Join: "انضم",
}

/* Arabic footer link labels, aligned by index with the English arrays above. */
export const footerAr: Record<string, string[]> = {
  Evidence: [
    "دراسات الحالة",
    "تقرير الأثر (سنوي)",
    "العملاء والمراجع",
    "الشهادات",
  ],
  Method: [
    "معمارية LDIA",
    "الأدوات",
    "معجم المجالات",
    "الترخيص والشروط المفتوحة",
  ],
  Knowledge: [
    "مكتبة الإصدارات",
    "ملاحظات التطبيق والمنهج",
    "موجزات السياسات (عربي/إنجليزي)",
    "منتجات البيانات والمؤشرات",
    "البودكاست والنصوص",
  ],
  Learning: [
    "دليل الدورات",
    "تقويم البرامج المفتوحة",
    "تدريب المدربين",
    "سجل المدربين المعتمدين",
    "ترخيص الأكاديميات",
  ],
  About: [
    "المؤسس والفريق",
    "الشركاء والخبراء",
    "لماذا شركة صغيرة",
    "الامتثال والسياسات",
    "التواصل والمكاتب",
  ],
  Join: [
    "الوظائف والشواغر",
    "تسجيل شبكة الخبراء",
    "لوحة فرص الخبراء",
    "التدريب (AAST)",
    "أرشيف النشرة",
  ],
}
