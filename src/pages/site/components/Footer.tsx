import { footer } from '@/content/data'
import { GoldLine, Logo } from '@/components/motion/fx'

/* Every footer link is wired to the real section route it belongs to; a few
   specials jump straight to their section. */
const FOOTER_PATHS: Record<string, string> = {
  Evidence: '/evidence',
  Method: '/method',
  Knowledge: '/knowledge',
  Learning: '/learning',
  About: '/about',
  Join: '/join',
}

const LINK_OVERRIDES: Record<string, string> = {
  'Contact & offices': '/contact',
  'Newsletter archive': '/join',
}

const legal = [
  ['Legal identity', 'TerraMorph Advisory LLC'],
  ['Commercial reg.', 'CR No. 184 562 · Cairo'],
  ['Tax ID', 'TIN 742-118-903'],
  ['Registered address', 'New Cairo, Egypt'],
]

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
              <p className="eyebrow text-gold-strong">{h}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-navy-2">
                {ls.map((l) => (
                  <li key={l}><a href={LINK_OVERRIDES[l] ?? FOOTER_PATHS[h] ?? '/'} className="hover:text-navy hover:underline decoration-gold underline-offset-4">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 border-t border-line pt-8 text-xs text-slate md:grid-cols-4">
          {legal.map(([l, v]) => (
            <div key={l}><p className="eyebrow text-navy">{l}</p><p className="mt-2">{v}</p></div>
          ))}
        </div>
        <p className="eyebrow mt-10 text-slate">© 2026 TerraMorph · Leverage for good</p>
      </div>
    </footer>
  )
}

export { Footer }