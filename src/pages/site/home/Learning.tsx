import { useState } from 'react'
import { Reveal } from '@/components/motion/fx'
import { Head } from './Head'
import { RequestDialog, type RequestConfig } from '@/pages/site/components/RequestDialog'
import type { Lang } from '../types'

/* ——— 06 Learning: price-bearing, bookable programmes ——— */
export const programmes = [
  { d: '12', m: 'Nov', mAr: 'نوفمبر', title: 'Local economic development — practitioner course', titleAr: 'التنمية الاقتصادية المحلية — دورة تطبيقية', fmt: 'In person · Cairo · 3 days', fmtAr: 'حضوري · القاهرة · 3 أيام', price: 'EGP 9,500', priceAr: '9,500 ج.م', seats: 6 },
  { d: '03', m: 'Dec', mAr: 'ديسمبر', title: 'Train-the-trainer: the TerraMorph method', titleAr: 'تدريب المدربين: منهج TerraMorph', fmt: 'Hybrid · 5 days · certification', fmtAr: 'مختلط · 5 أيام · شهادة', price: 'EGP 18,000', priceAr: '18,000 ج.م', seats: 3 },
  { d: '14', m: 'Jan', mAr: 'يناير', title: 'Tailored diagnostics for public institutions', titleAr: 'تشخيصات مُخصّصة للمؤسسات العامة', fmt: 'Online · 4 × 2 h', fmtAr: 'أونلاين · 4 × ساعتان', price: 'EGP 4,200', priceAr: '4,200 ج.م', seats: 14 },
  { d: '—', m: 'Open', mAr: 'مفتوح', title: 'Welcome method — onboarding for new teams', titleAr: 'منهج الترحيب — تهيئة للفرق الجديدة', fmt: 'Self-paced · AR/EN', fmtAr: 'وتيرتك الخاصة · عربي/إنجليزي', price: 'Free for NGOs', priceAr: 'مجاني للمنظمات غير الحكومية', seats: 0 },
]
export function Learning({ lang }: { lang: Lang }) {
  const ar = lang === 'ar'
  const [req, setReq] = useState<RequestConfig | null>(null)
  return (
    <section id="learning" className="scroll-mt-40 bg-ivory-2">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10">
        <Head n="05" eyebrow={ar ? 'تعلّم TerraMorph' : 'TerraMorph Learning'} title={ar ? 'مستعد لمزيد من الدافع؟ اختر موعدًا.' : 'Ready to get more motivated? Pick a date.'}
          aside={<p className="max-w-xs text-sm text-slate">{ar ? 'كل برنامج له سعر وموعد — لا "تواصل معنا للتفاصيل".' : 'Every programme carries a price and a date — no "contact us for details".'}</p>} />
        <ul className="mt-12 border-t border-navy/20">
          {programmes.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80} className="group grid items-center gap-4 border-b border-navy/10 py-6 transition-colors hover:bg-ivory md:grid-cols-[90px_1fr_180px_180px] md:px-4">
              <div className="flex items-baseline gap-2 md:block"><span className="font-display text-5xl leading-none">{p.d}</span><span className="eyebrow text-gold-strong md:mt-1 md:block">{ar ? p.mAr : p.m}</span></div>
              <div><p className="font-display text-2xl font-medium">{ar ? p.titleAr : p.title}</p><p className="mt-1 text-sm text-slate">{ar ? p.fmtAr : p.fmt}</p></div>
              <div><p className="text-lg">{ar ? p.priceAr : p.price}</p>{p.seats > 0 && <p className={`text-xs ${p.seats < 5 ? 'text-warn-strong' : 'text-slate'}`}>{ar ? `متبقٍ ${p.seats} مقعد` : `${p.seats} seats left`}</p>}</div>
              <button onClick={() => setReq({ kind: 'SEAT_RESERVATION', title: ar ? `احجز مقعدًا — ${p.titleAr}` : `Reserve a seat — ${p.title}`, intro: `${p.d} ${ar ? p.mAr : p.m} · ${ar ? p.fmtAr : p.fmt} · ${ar ? p.priceAr : p.price}`, context: { programme: p.title, date: `${p.d} ${p.m}`, format: p.fmt, price: p.price, seatsLeft: p.seats }, submitLabel: ar ? 'أكّد الحجز' : 'Confirm reservation' })}
                className="cursor-pointer justify-self-start border border-navy px-5 py-3 text-xs tracking-[0.18em] uppercase transition md:justify-self-end group-hover:bg-navy group-hover:text-ivory rtl:normal-case rtl:tracking-normal">
                {p.seats ? (ar ? 'احجز مقعدًا' : 'Reserve seat') : ar ? 'ابدأ الآن' : 'Start now'}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <RequestDialog request={req} onClose={() => setReq(null)} />
    </section>
  )
}
