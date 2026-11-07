/**
 * Sub-processor registry for TerraMorph
 * Each entry represents a third-party processor with whom we have a DPA in place
 */

export type SubProcessorCategory =
  | 'hosting'
  | 'email'
  | 'analytics'
  | 'payment'
  | 'communication'
  | 'storage'
  | 'ai'
  | 'other';

export interface SubProcessor {
  id: string;
  name: string;
  category: SubProcessorCategory;
  purpose: string;
  purposeAr: string;
  location: string;
  dpaSigned: boolean;
  dpaDate: string;
  retention: string;
  website: string;
  certifications?: string[];
  description: string;
  descriptionAr: string;
}

export const SUB_PROCESSORS: SubProcessor[] = [
  {
    id: 'neon',
    name: 'Neon (PostgreSQL)',
    category: 'hosting',
    purpose: 'Primary database hosting for client portal and content API',
    purposeAr: 'استضافة قاعدة البيانات الأساسية لبوابة العملاء وواجهة برمجة المحتوى',
    location: 'EU (Frankfurt) / US (Virginia) - configurable per project',
    dpaSigned: true,
    dpaDate: '2026-01-15',
    retention: 'Data retained per engagement lifecycle; deleted 30 days after engagement closure unless legal hold applies',
    website: 'https://neon.tech',
    certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR-ready'],
    description: 'Serverless PostgreSQL with autoscaling, branching, and point-in-time recovery. Used for all workspace data, content items, and user sessions.',
    descriptionAr: 'PostgreSQL غير خادم مع التوسع التلقائي، التفرع، والاستعادة للنقطة الزمنية. تُستخدم لجميع بيانات مساحة العمل، عناصر المحتوى، وجلسات المستخدم.',
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'email',
    purpose: 'Transactional email delivery (auth, notifications, submissions)',
    purposeAr: 'تسليم رسائل البريد الإلكتروني المعاملاتية (المصادقة، الإشعارات، التسليمات)',
    location: 'US (global edge delivery)',
    dpaSigned: true,
    dpaDate: '2026-02-01',
    retention: 'Email logs retained 30 days; content not stored beyond delivery confirmation',
    website: 'https://resend.com',
    certifications: ['SOC 2 Type II', 'ISO 27001'],
    description: 'Developer-focused transactional email API with high deliverability. Used for password resets, submission confirmations, and system notifications.',
    descriptionAr: 'واجهة برمجة بريد إلكتروني مخصصة للمطورين مع قابلية تسليم عالية. تُستخدم لإعادة تعيين كلمات المرور، تأكيدات التسليم، والإشعارات النظامية.',
  },
  {
    id: 'plausible',
    name: 'Plausible Analytics (self-hosted)',
    category: 'analytics',
    purpose: 'Privacy-friendly website analytics (no cookies, no personal data)',
    purposeAr: 'تحليلات موقع صديقة للخصوصية (بدون ملفات تعريف ارتباط، بدون بيانات شخصية)',
    location: 'EU (self-hosted on Neon compute)',
    dpaSigned: true,
    dpaDate: '2026-03-10',
    retention: 'Aggregated metrics retained 13 months; no individual user data stored',
    website: 'https://plausible.io',
    certifications: ['GDPR-compliant by design', 'ePrivacy compliant'],
    description: 'Self-hosted Plausible instance on our infrastructure. No cookies, no personal data collection. Only aggregated page views, referrers, and device types.',
    descriptionAr: 'مثيل Plausible مستضاف ذاتيًا على بنيتنا التحتية. بدون ملفات تعريف ارتباط، بدون جمع بيانات شخصية. فقط مشاهدات الصفحات المجمعة، مصادر الإحالة، وأنواع الأجهزة.',
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    purpose: 'Object storage for media library uploads (images, PDFs, documents)',
    purposeAr: 'تخزين العناصر لرفع ملفات مكتبة الوسائط (الصور، PDFs، المستندات)',
    location: 'Global (automatic routing to nearest region)',
    dpaSigned: true,
    dpaDate: '2026-04-01',
    retention: 'Files retained until deleted by admin; versioned for 30 days',
    website: 'https://r2.cloudflare.com',
    certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR DPA available'],
    description: 'S3-compatible object storage with zero egress fees. Used for all media library assets. Automatic geo-routing to nearest data center.',
    descriptionAr: 'تخزين عناصر متوافق مع S3 مع صفر رسوم تصدير. يُستخدم لجميع أصول مكتبة الوسائط. توجيه جغرافي تلقائي لأقرب مركز بيانات.',
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'ai',
    purpose: 'AI-assisted content generation (summaries, translations, drafts) - opt-in only',
    purposeAr: 'توليد محتوى بمساعدة الذكاء الاصطناعي (ملخصات، ترجمات، مسودات) - بالاختيار فقط',
    location: 'US (OpenAI infrastructure)',
    dpaSigned: true,
    dpaDate: '2026-05-15',
    retention: 'OpenAI retains API data for 30 days (abuse monitoring); we do not send PII without consent',
    website: 'https://openai.com',
    certifications: ['SOC 2 Type II', 'ISO 27001', 'Data Processing Addendum'],
    description: 'Used only when user explicitly enables AI features. Content sent is limited to the specific text being processed. No training on customer data.',
    descriptionAr: 'تُستخدم فقط عند تمكين المستخدم لميزات الذكاء الاصطناعي صراحةً. المحتوى المرسل يقتصر على النص المحدد للمعالجة. لا تدريب على بيانات العملاء.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude API',
    category: 'ai',
    purpose: 'Alternative AI provider for content assistance - opt-in only',
    purposeAr: 'مزود ذكاء اصطناعي بديل للمساعدة في المحتوى - بالاختيار فقط',
    location: 'US (Anthropic infrastructure)',
    dpaSigned: true,
    dpaDate: '2026-06-01',
    retention: 'Anthropic retains for 30 days (safety); no training on customer data per DPA',
    website: 'https://anthropic.com',
    certifications: ['SOC 2 Type II', 'ISO 27001', 'Data Processing Addendum'],
    description: 'Alternative to OpenAI for users who prefer Claude. Same opt-in controls and data handling.',
    descriptionAr: 'بديل لـ OpenAI للمستخدمين الذين يفضلون Claude. نفس ضوابط الاختيار ومعالجة البيانات.',
  },
];

export const SUB_PROCESSOR_CATEGORIES: { value: SubProcessorCategory; label: string; labelAr: string }[] = [
  { value: 'hosting', label: 'Hosting & Infrastructure', labelAr: 'الاستضافة والبنية التحتية' },
  { value: 'email', label: 'Email & Communications', labelAr: 'البريد الإلكتروني والاتصالات' },
  { value: 'analytics', label: 'Analytics & Monitoring', labelAr: 'التحليلات والمراقبة' },
  { value: 'payment', label: 'Payments & Billing', labelAr: 'المدفوعات والفوترة' },
  { value: 'communication', label: 'Communication & Collaboration', labelAr: 'التواصل والتعاون' },
  { value: 'storage', label: 'Storage & CDN', labelAr: 'التخزين وشبكة توصيل المحتوى' },
  { value: 'ai', label: 'AI & Machine Learning', labelAr: 'الذكاء الاصطناعي والتعلم الآلي' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

export function getSubProcessorsByCategory(category: SubProcessorCategory): SubProcessor[] {
  return SUB_PROCESSORS.filter(p => p.category === category);
}

export function getSubProcessorById(id: string): SubProcessor | undefined {
  return SUB_PROCESSORS.find(p => p.id === id);
}