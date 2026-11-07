/**
 * Cookie Policy — Arabic
 * Last updated: نوفمبر ٢٠٢٦
 */

export const cookiePolicyAr = {
  meta: {
    title: "سياسة ملفات تعريف الارتباط",
    description: "كيف تستخدم TerraMorph ملفات تعريف الارتباط والتقنيات المماثلة على askterramorph.com.",
    lastUpdated: "2026-11-07",
  },

  sections: [
    {
      id: "what",
      heading: "ما هي ملفات تعريف الارتباط",
      body: [
        "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزن على جهازك عند زيارة موقع ويب. تساعد الموقع على العمل، تذكر التفضيلات، وفهم الاستخدام.",
        "تقنيات مشابهة: localStorage، sessionStorage، بكسلات التتبع.",
      ],
    },
    {
      id: "categories",
      heading: "فئات ملفات تعريف الارتباط",
      body: [
        "نستخدم ثلاث فئات. فقط الملفات الأساسية تُضبط دون موافقتك.",
      ],
    },
    {
      id: "essential",
      heading: "أساسية (ضرورية للغاية) — لا تتطلب موافقة",
      items: [
        {
          name: "tm_session",
          purpose: "رمز مصادقة الجلسة (HMAC-SHA256 لرمز عشوائي). HttpOnly، Secure، SameSite=Lax/None. تنتهي في ١٤ يومًا.",
          domain: "askterramorph.com / api.askterramorph.com",
        },
        {
          name: "csrf_token",
          purpose: "حماية CSRF للطلبات التي تغير الحالة. تُجدد لكل جلسة.",
          domain: "askterramorph.com",
        },
        {
          name: "cookie_consent",
          purpose: "تخزن اختيارات موافقتك على ملفات تعريف الارتباط (الفئات المقبولة/المرفوضة). تنتهي في سنة واحدة.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "analytics",
      heading: "تحليلية — تتطلب موافقة",
      items: [
        {
          name: "_ga / _gid / _gat (إذا مُفعلة)",
          purpose: "Google Analytics — مشاهدات صفحات، مصدر إحالة، وقت البقاء، IP بأسماء مستعارة. تُحمل فقط بعد الموافقة.",
          domain: "askterramorph.com",
        },
        {
          name: "plausible_* (إذا كان Plausible مستضافًا ذاتيًا)",
          purpose: "تحليلات صديقة للخصوصية — لا بيانات شخصية، لا ملفات تعريف ارتباط افتراضيًا. تُحمل فقط بعد الموافقة.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "marketing",
      heading: "تسويقية — تتطلب موافقة (غير مستخدمة افتراضيًا)",
      items: [
        {
          name: "_fbp, _gcl_aw, إلخ.",
          purpose: "تتبع التحويل للحملات المدفوعة. تُحمل فقط إذا اخترت الاشتراك وكنا نشغل حملات مدفوعة.",
          domain: "askterramorph.com",
        },
      ],
    },
    {
      id: "manage",
      heading: "إدارة تفضيلاتك",
      body: [
        "شريط ملفات تعريف الارتباط: متاح عبر رابط \"تفضيلات ملفات تعريف الارتباط\" في التذييل في أي وقت.",
        "إعدادات المتصفح: حظر/حذف ملفات تعريف الارتباط (قد يكسر الوظائف الأساسية).",
        "سحب الموافقة: أوقف الفئات في الشريط؛ تُحذف ملفات تعريف الارتباط غير الأساسية عند تحميل الصفحة التالية.",
      ],
    },
    {
      id: "third-party",
      heading: "ملفات تعريف ارتباط الجهات الخارجية",
      body: [
        "لا نضبط ملفات تعريف ارتباط جهات خارجية مباشرة.",
        "المحتوى المضمن (YouTube، LinkedIn، X/Twitter) قد يضبط ملفات تعريف ارتباط خاصة به عند تفاعلك. نستخدم تضمينات محسنة للخصوصية (youtube-nocookie، إلخ) حيثما تتوفر.",
      ],
    },
    {
      id: "retention",
      heading: "ملخص الاحتفاظ",
      items: [
        { name: "tm_session", retention: "١٤ يومًا (متجدد)" },
        { name: "csrf_token", retention: "جلسة" },
        { name: "cookie_consent", retention: "سنة واحدة" },
        { name: "ملفات تعريف الارتباط التحليلية", retention: "١٤ شهرًا (Google) / حسب المزود" },
        { name: "ملفات تعريف الارتباط التسويقية", retention: "حسب المزود (أقصى ١٣ شهرًا)" },
      ],
    },
    {
      id: "contact",
      heading: "التواصل",
      body: [
        "استفسارات: info@askterramorph.com",
      ],
    },
  ],
};

export default cookiePolicyAr;