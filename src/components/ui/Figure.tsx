import { Emblem } from "@/components/motion/fx"

/* Formal image frame. Works as a real photo when `src` is given, and as a
   branded, titled placeholder when it is not — so a layout can be published
   before the photography exists without ever looking broken. */
export function Figure({
  src,
  alt,
  title,
  eyebrow,
  caption,
  credit,
  ratio = "3 / 2",
  ink = false,
  className = "",
}: {
  src?: string
  alt: string
  title?: string
  eyebrow?: string
  caption?: string
  credit?: string
  ratio?: string
  ink?: boolean
  className?: string
}) {
  return (
    <figure
      className={`group/fig overflow-hidden border ${
        ink ? "border-ivory/15 bg-navy-3" : "border-line bg-ivory-2"
      } ${className}`}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: ratio }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover/fig:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(49,69,91,.55),transparent_60%)]">
            <span
              aria-hidden
              className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(135deg,#FBF8F1_0_1px,transparent_1px_16px)]"
            />
            <span className="relative flex flex-col items-center gap-3">
              <Emblem className="h-12 w-12" tone="ivory" />
              <span className="eyebrow text-ivory/55">Image to come</span>
            </span>
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-3/90 via-navy-3/15 to-transparent"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute start-3 top-3 h-6 w-6 border-s border-t border-gold-light/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute end-3 top-3 h-6 w-6 border-e border-t border-gold-light/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute end-3 bottom-3 h-6 w-6 border-e border-b border-gold-light/70"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute start-3 bottom-3 h-6 w-6 border-s border-b border-gold-light/70"
        />

        {(eyebrow || title) && (
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-ivory md:p-8">
            {eyebrow && <p className="eyebrow text-gold-light">{eyebrow}</p>}
            {title && (
              <p className="mt-2 max-w-2xl font-display text-[clamp(1.4rem,2.6vw,2.2rem)] leading-snug">
                {title}
              </p>
            )}
          </figcaption>
        )}
      </div>

      {caption && (
        <figcaption
          className={`flex flex-wrap items-baseline justify-between gap-3 px-5 py-4 text-xs ${
            ink ? "text-ivory/60" : "text-slate"
          }`}
        >
          <span>{caption}</span>
          {credit && <span className="eyebrow opacity-70">{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
