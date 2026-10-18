import { useEffect, useState } from "react"
import type { Lang } from "./types"

/* Intro: the emblem is constructed — ring, meridians, columns rise one by one,
   wordmark resolves, then the navy ground lifts away like a lever releasing. */
export default function Intro({
  onDone,
  onLift,
  lang,
}: {
  onDone: () => void
  onLift: () => void
  lang: Lang
}) {
  const ar = lang === "ar"
  const [phase, setPhase] = useState<"draw" | "word" | "lift">("draw")
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reduced) {
      onLift()
      onDone()
      return
    }
    document.body.style.overflow = "hidden"
    const t = [
      setTimeout(() => setPhase("word"), 1500),
      setTimeout(() => {
        setPhase("lift")
        onLift()
      }, 2900),
      setTimeout(onDone, 3900),
    ]
    return () => {
      t.forEach(clearTimeout)
      document.body.style.overflow = ""
    }
  }, [onDone, onLift])
  const skip = () => {
    setPhase("lift")
    onLift()
    setTimeout(onDone, 900)
  }

  return (
    <div
      role="presentation"
      onClick={skip}
      className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-navy-3 text-ivory transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] ${
        phase === "lift"
          ? "[clip-path:inset(0_0_100%_0)]"
          : "[clip-path:inset(0_0_0_0)]"
      }`}
    >
      <div
        className="absolute inset-x-0 top-1/2 h-px origin-left bg-gold-light/30"
        style={{ animation: "grow 1.4s cubic-bezier(.2,.8,.2,1) both" }}
      />
      <div
        className={`relative flex flex-col items-center transition-transform duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] ${
          phase === "lift" ? "-translate-y-24 opacity-0" : ""
        }`}
        style={{ transitionProperty: "transform, opacity" }}
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 75 74"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-32 w-32 md:h-40 md:w-40"
        >
          <path
            d="M37.3115 0.5C57.637 0.50001 74.1228 16.8119 74.123 36.9443C74.123 57.077 57.6371 73.3896 37.3115 73.3896C16.9859 73.3896 0.5 57.077 0.5 36.9443C0.50021 16.8119 16.986 0.5 37.3115 0.5Z"
            stroke="#FBF8F1"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: "0s" }}
          />
          <path
            d="M62.7072 60.8857C56.3182 67.5198 47.3045 71.6552 37.3116 71.6553C27.3186 71.6553 18.3041 67.5201 11.9152 60.8857H62.7072ZM72.3839 37.4443C72.329 41.2974 71.6416 44.9977 70.4171 48.4482C68.9083 52.7 66.585 56.5727 63.6339 59.8857H10.9884C8.03743 56.5728 5.7149 52.6999 4.20618 48.4482C2.9817 44.9976 2.29334 41.2974 2.2384 37.4443H72.3839ZM63.6349 14.0039C66.5856 17.3167 68.9085 21.1891 70.4171 25.4404C71.6415 28.8909 72.3289 32.5914 72.3839 36.4443H2.2384C2.29339 32.5914 2.98174 28.8909 4.20618 25.4404C5.71478 21.1893 8.03687 17.3166 10.9874 14.0039L63.6349 14.0039ZM37.3116 2.2334C47.3049 2.23345 56.3192 6.36937 62.7081 13.0039L11.9152 13.0039C18.3042 6.36943 27.3185 2.2334 37.3116 2.2334Z"
            stroke="#C4A868"
            strokeOpacity="0.7"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: ".25s" }}
          />
          <path
            d="M37.3121 2.55078C43.7082 2.55093 49.4348 6.4948 53.5387 12.7383C57.6454 18.986 60.1686 27.5884 60.1686 37.0645C60.1685 46.5403 57.6452 55.142 53.5387 61.3896C49.4348 67.6331 43.7082 71.577 37.3121 71.5771C30.9159 71.5771 25.1895 67.6332 21.0856 61.3896C16.9789 55.142 14.4548 46.5403 14.4547 37.0645C14.4547 27.5884 16.9789 18.986 21.0856 12.7383C25.1895 6.49485 30.916 2.55078 37.3121 2.55078Z"
            stroke="#C4A868"
            strokeOpacity="0.6"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: ".4s" }}
          />
          <path
            d="M37.3113 2.55078C39.0653 2.55079 40.6525 3.64217 42.0212 5.41895C43.3954 7.2027 44.6117 9.75248 45.6238 12.8584C47.6497 19.0759 48.8943 27.6343 48.8943 37.0645C48.8943 46.4944 47.6496 55.0521 45.6238 61.2695C44.6117 64.3756 43.3954 66.9262 42.0212 68.71C40.6525 70.4866 39.0652 71.5771 37.3113 71.5771C35.5573 71.5771 33.9701 70.4866 32.6013 68.71C31.2271 66.9262 30.0109 64.3756 28.9988 61.2695C26.973 55.0521 25.7283 46.4944 25.7283 37.0645C25.7283 27.6342 26.9729 19.0759 28.9988 12.8584C30.0108 9.75247 31.2272 7.2027 32.6013 5.41895C33.9701 3.64216 35.5572 2.55078 37.3113 2.55078Z"
            stroke="#C4A868"
            strokeOpacity="0.4"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: ".5s" }}
          />
          <path
            d="M22.668 8.80371L52.1426 8.80371C52.3617 8.80368 52.5391 8.62538 52.5391 8.40625V5.09473C52.539 4.87565 52.3616 4.69827 52.1426 4.69824L22.668 4.69824C22.449 4.69824 22.2706 4.87563 22.2705 5.09473V8.40625C22.2705 8.62539 22.4488 8.80371 22.668 8.80371Z"
            fill="#FBF8F1"
            className="intro-rise"
            style={{ animationDelay: ".7s" }}
          />
          <path
            d="M49.89 11.1216V9.33447L24.9203 9.33447V11.1216L49.89 11.1216Z"
            fill="#FBF8F1"
            className="intro-rise"
            style={{ animationDelay: ".75s" }}
          />
          <path
            d="M47.2408 60.4673L47.2408 11.6528H27.5699L27.5699 60.4673H47.2408Z"
            fill="#FBF8F1"
            className="intro-rise"
            style={{ animationDelay: ".8s" }}
          />
          <path
            d="M49.89 63.7788V60.6665H24.9203V63.7788H49.89Z"
            fill="#FBF8F1"
            className="intro-rise"
            style={{ animationDelay: ".85s" }}
          />
          <path
            d="M22.0057 68.7466H52.8046C53.0237 68.7466 53.202 68.5683 53.202 68.3491V64.3755C53.202 64.1563 53.0237 63.979 52.8046 63.979H22.0057C21.7866 63.979 21.6083 64.1563 21.6083 64.3755V68.3491C21.6083 68.5683 21.7867 68.7466 22.0057 68.7466Z"
            fill="#FBF8F1"
            className="intro-rise"
            style={{ animationDelay: ".9s" }}
          />
          <path
            d="M31.8096 14.938L31.8096 58.9519"
            stroke="#C4A868"
            strokeWidth="1.5"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: "1s" }}
          />
          <path
            d="M37.6783 14.938L37.6783 58.9519"
            stroke="#C4A868"
            strokeWidth="1.5"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: "1.1s" }}
          />
          <path
            d="M43.546 14.938L43.546 58.9519"
            stroke="#C4A868"
            strokeWidth="1.5"
            className="intro-draw"
            pathLength={1}
            style={{ animationDelay: "1.2s" }}
          />
        </svg>
        <p
          className="mt-8 flex overflow-hidden font-display text-3xl font-semibold tracking-[0.3em] md:text-5xl"
          aria-label="TerraMorph"
        >
          {"TERRAMORPH".split("").map((c, i) => (
            <span
              key={i}
              className="inline-block transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{
                transitionDelay: `${i * 45}ms`,
                transform: phase === "draw" ? "translateY(110%)" : "none",
                opacity: phase === "draw" ? 0 : 1,
                filter: phase === "draw" ? "blur(6px)" : "none",
              }}
            >
              {c}
            </span>
          ))}
        </p>
        <p
          className={`mt-4 text-[0.65rem] font-medium tracking-[0.6em] text-gold-light transition-all delay-500 duration-700 ${
            phase === "draw" ? "tracking-[1.2em] opacity-0" : ""
          }`}
        >
          {ar ? "رافعة للخير" : "LEVERAGE FOR GOOD"}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          skip()
        }}
        className="eyebrow absolute end-6 bottom-6 text-ivory/65 transition hover:text-ivory"
      >
        {ar ? "تخطّي المقدمة" : "Skip intro"}
      </button>
    </div>
  )
}
