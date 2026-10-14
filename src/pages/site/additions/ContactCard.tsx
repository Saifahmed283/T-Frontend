import { Reveal, SplitText } from '@/components/motion/fx'

/* ——— Contact card ——— */
export function ContactCard() {
  return (
    <section id="contact" className="mx-auto max-w-[1320px] scroll-mt-40 px-5 py-24 md:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <h2 className="text-[clamp(2.4rem,5vw,4.4rem)] leading-[1] font-medium"><SplitText text="Hello! We are TerraMorph," /><SplitText className="italic text-navy-2" text="and we are consultants." delay={300} /></h2>
        <Reveal>
          <div className="relative -rotate-2 border border-navy bg-ivory p-10 shadow-[16px_16px_0_0_var(--color-gold-light)] transition-transform duration-500 hover:rotate-0">
            <p className="eyebrow text-gold-strong">Contact us</p>
            <ul className="mt-6 space-y-5">
              {[['Website', 'askterramorph.com', 'https://askterramorph.com'], ['LinkedIn', '/company/terramorph', 'https://linkedin.com'], ['Phone', '+20 100 000 0000', 'tel:+201000000000'], ['Email', 'hello@askterramorph.com', 'mailto:hello@askterramorph.com']].map(([l, v, h]) => (
                <li key={l} className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <span className="eyebrow text-slate">{l}</span>
                  <a href={h} className="font-display text-xl hover:text-gold-strong md:text-2xl">{v}</a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}