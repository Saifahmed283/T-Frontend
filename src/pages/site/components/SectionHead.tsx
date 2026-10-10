import { GoldLine, SplitText } from '@/components/motion/fx'

function SectionHead({ id, n, eyebrow, title, aside }: { id?: string; n: string; eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-40">
      <div className="flex items-center gap-4">
        <span className="eyebrow text-gold">{n}</span>
        <span className="eyebrow text-slate">{eyebrow}</span>
      </div>
      <GoldLine className="mt-4" />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-medium"><SplitText text={title} /></h2>
        {aside}
      </div>
    </div>
  )
}

export { SectionHead }