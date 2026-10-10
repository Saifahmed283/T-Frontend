import { footer } from '@/content/data'
import { GoldLine, Logo } from '@/components/motion/fx'

function Footer() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto max-w-[1320px] px-5 pt-20 pb-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Logo />
          <p className="max-w-sm font-display text-xl italic text-navy-2">Reshaping the ground on which economies stand.</p>
        </div>
        <GoldLine className="mt-10" />
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(footer).map(([h, ls]) => (
            <div key={h}>
              <p className="eyebrow text-gold">{h}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-navy-2">
                {ls.map((l) => <li key={l}><a href="#" className="hover:text-navy hover:underline decoration-gold underline-offset-4">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 border-t border-line pt-8 text-xs text-slate md:grid-cols-4">
          <div><p className="eyebrow text-navy">Legal identity</p><p className="mt-2">TerraMorph Advisory LLC</p></div>
          <div><p className="eyebrow text-navy">Commercial reg.</p><p className="mt-2">CR No. 184 562 · Cairo</p></div>
          <div><p className="eyebrow text-navy">Tax ID</p><p className="mt-2">TIN 742-118-903</p></div>
          <div><p className="eyebrow text-navy">Registered address</p><p className="mt-2">New Cairo, Egypt</p></div>
        </div>
        <p className="eyebrow mt-10 text-slate">© 2026 TerraMorph · Leverage for good</p>
      </div>
    </footer>
  )
}

export { Footer }