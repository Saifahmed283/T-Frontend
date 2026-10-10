export const audiences = [
  { slug: 'governments', label: 'For governments', ar: 'للحكومات', line: 'Governorates, ministries and authorities — mandate-mapped work inside your rules.', action: 'Download the procurement pack', q: ['Can you work inside our rules?', 'Have you done this in Egypt?', 'What will it cost us to find out?'] },
  { slug: 'development-partners', label: 'For development partners', ar: 'لشركاء التنمية', line: 'Registration identifiers, framework eligibility and a full assignment ledger.', action: 'Request the capability statement', q: ['Are you registered and eligible?', 'Where is the evidence?', 'Who exactly delivers?'] },
  { slug: 'business', label: 'For business', ar: 'للأعمال', line: 'A price-bearing diagnostic and a bookable date — not a sales call.', action: 'Book the diagnostic', q: ['What does it cost?', 'When can you start?', 'What do we get at the end?'] },
  { slug: 'ngos', label: 'For NGOs', ar: 'للمنظمات غير الحكومية', line: 'Free method notes, open-licence tools and a scaled-down engagement model.', action: 'Get the free toolkit', q: ['What is free?', 'Can you fit a small budget?', 'Will you build our capacity?'] },
  { slug: 'consultancies', label: 'For consultancies', ar: 'للاستشاريين', line: 'A specialist sub-partner with method, local reach and clean compliance.', action: 'Propose a teaming arrangement', q: ['What do you bring to a bid?', 'Are you compliant?', 'Who signs the CVs?'] },
  { slug: 'careers', label: 'Careers', ar: 'الوظائف', line: 'Vacancies, internships with AAST, and a firm that names its people.', action: 'See open roles', q: ['What roles are open?', 'How do you grow people?', 'Who would I work with?'] },
  { slug: 'experts', label: 'Expert network', ar: 'شبكة الخبراء', line: 'Register once, see your status, and be matched to live assignments.', action: 'Register as an expert', q: ['What happens after I register?', 'How are experts matched?', 'How are fees set?'] },
]

export const method = [
  { g: 'G0', name: 'Mandate', time: '1–2 wks', body: 'Fix the question, the client, the decision it serves and the rules it must live inside. Nothing starts without a signed mandate note.', out: 'Mandate note' },
  { g: 'G1', name: 'Diagnose', time: '2–4 wks', body: 'Read the ground as it is: institutions, incentives, data. A diagnostic that names the binding constraint, not a list of everything.', out: 'Binding-constraint diagnostic' },
  { g: 'G2', name: 'Locate the lever', time: '1–2 wks', body: 'Find the smallest well-placed force that moves the largest outcome — capital, policy or know-how, where it compounds.', out: 'Lever map' },
  { g: 'G3', name: 'Design', time: '3–6 wks', body: 'Instrument design with costed options, owners and sequencing. Each option carries its own risk register.', out: 'Instrument design' },
  { g: 'G4', name: 'Align', time: '2–4 wks', body: 'Build the coalition: ministries, partners, private actors. Consultation recorded, objections answered in writing.', out: 'Consultation record' },
  { g: 'G5', name: 'Deliver', time: 'Variable', body: 'Implementation support embedded in the client institution, with monthly dashboards against the agreed indicators.', out: 'Delivery dashboard' },
  { g: 'G6', name: 'Measure', time: 'Quarterly', body: 'Verify outcomes against baseline. Results published with method, so they can be checked by anyone.', out: 'Verified results note' },
  { g: 'G7', name: 'Transfer', time: '4–8 wks', body: 'Hand over method, tools and trained people. The engagement is successful when the client no longer needs us.', out: 'Transfer kit & certified trainers' },
]

export const cases = [
  { sector: 'Local economic development', year: '2025', title: 'A governorate investment map that moved EGP 1.2bn into three industrial zones', client: 'Governorate authority · Upper Egypt', tag: 'Public sector' },
  { sector: 'TVET reform', year: '2024', title: 'Re-tooling 14 technical schools around employer-validated curricula', client: 'Development partner programme', tag: 'Development partners' },
  { sector: 'Social enterprise', year: '2026', title: 'Blended-finance structure for a women-led agri-processing cooperative', client: 'Impact fund · Delta region', tag: 'NGOs' },
]

export const knowledge = [
  { type: 'Policy brief', lang: 'AR', title: 'إصلاح مناخ الاستثمار على مستوى المحافظات', meta: 'Sep 2026 · 9 min' },
  { type: 'Working paper', lang: 'EN', title: 'Leverage ratios in public–private TVET partnerships', meta: 'Aug 2026 · 24 min' },
  { type: 'Practice note', lang: 'EN', title: 'Writing a mandate note that survives a ministerial reshuffle', meta: 'Jul 2026 · 6 min' },
  { type: 'Podcast', lang: 'AR/EN', title: 'Ep. 12 — Small firms, large outcomes', meta: 'Jul 2026 · 41 min' },
]

export const footer: Record<string, string[]> = {
  Evidence: ['Assignment ledger', 'Case studies', 'Impact report (annual)', 'Clients & references', 'Certifications'],
  Method: ['The LDIA architecture', 'G0–G7 lifecycle', 'Instruments', 'Glossary of domains', 'Licensing & open terms'],
  Knowledge: ['Publications library', 'Practice & method notes', 'Policy briefs (AR/EN)', 'Data & index products', 'Podcast + transcripts'],
  Learning: ['Course catalogue', 'Open programmes calendar', 'Train-the-trainer', 'Certified trainer register', 'Licensing for academies'],
  About: ['Founder & team', 'Associates & experts', 'Why a small firm', 'Compliance & policies', 'Contact & offices'],
  Join: ['Careers & vacancies', 'Expert network registration', 'Expert opportunity board', 'Internships (AAST)', 'Newsletter archive'],
}
