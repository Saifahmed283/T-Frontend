import { audiences } from './data'
import { Contours, Logo } from './fx'
import { useHead } from './seo'

export default function NotFound() {
  useHead('Page not found', 'This TerraMorph page does not exist. Find evidence, knowledge and audience hubs from here.')
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-navy-3 px-5 text-ivory">
      <Contours className="absolute inset-0 h-full w-full" stroke="#FBF8F1" opacity={0.06} />
      <div className="relative max-w-2xl text-center">
        <a href="/" aria-label="TerraMorph home" className="inline-block"><Logo tone="ivory" /></a>
        <p className="eyebrow mt-16 text-gold-light">Error 404</p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] leading-[1] font-medium">This ground hasn't been surveyed.</h1>
        <p className="mx-auto mt-6 max-w-md text-ivory/70">The page you asked for doesn't exist or has moved. Start from the homepage, or go straight to your reader hub.</p>
        <a href="/" className="mt-10 inline-block bg-gold-light px-7 py-4 text-xs tracking-[0.2em] text-navy uppercase transition hover:bg-ivory">Back to the homepage</a>
        <nav aria-label="Audience hubs" className="mt-10 flex flex-wrap justify-center gap-2">
          {audiences.map((a) => <a key={a.slug} href={`/hub/${a.slug}`} className="rounded-full border border-ivory/15 px-3 py-1.5 text-sm text-ivory/70 transition hover:border-gold-light hover:text-ivory">{a.label}</a>)}
        </nav>
      </div>
    </main>
  )
}
