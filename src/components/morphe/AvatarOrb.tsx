import { useEffect, useId, useRef, useState } from "react";

/**
 * TerraMorph AI — a living version of the house seal.
 *
 * The brand mark is a classical column inside a thin gold ring: the pillar
 * that holds the ground economies stand on. The companion keeps that column
 * as its face, and gives it a mind. A gold iris sits where the capital of the
 * column would be, and it follows the visitor's cursor — the small, well-placed
 * attention the practice is named for. Concentric survey rings (the same
 * contour language as the site's globe) orbit it, and a single gold meridian
 * sweeps like a diagnostic being drawn.
 */
export function AvatarOrb({
  size = 44,
  tracking = true,
  pulse = true,
}: {
  size?: number;
  pulse?: boolean;
  tracking?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!tracking) return;
    const handle = (event: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const reach = 260;
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
      const max = size * 0.085;
      setGaze({
        x: Math.max(-max, Math.min(max, (dx / reach) * max * 6 * strength)),
        y: Math.max(-max, Math.min(max, (dy / reach) * max * 6 * strength)),
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [tracking, size]);

  return (
    <span
      ref={ref}
      className={`avatar-orb${pulse ? " pulse" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <radialGradient id={`${uid}-face`} cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#1d3a58" />
            <stop offset="72%" stopColor="#10253d" />
            <stop offset="100%" stopColor="#081624" />
          </radialGradient>
          <radialGradient id={`${uid}-iris`} cx="38%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#f4e7c4" />
            <stop offset="46%" stopColor="#c4a868" />
            <stop offset="100%" stopColor="#7d6230" />
          </radialGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6d3a2" />
            <stop offset="55%" stopColor="#c4a868" />
            <stop offset="100%" stopColor="#8d6e38" />
          </linearGradient>
        </defs>

        <circle className="orb-survey s1" cx="60" cy="60" r="56" />
        <circle className="orb-survey s2" cx="60" cy="60" r="49" />
        <circle className="orb-survey s3" cx="60" cy="60" r="42.5" />

        <g className="orb-sweep">
          <path d="M60 8 A52 52 0 0 1 108 48" />
        </g>

        <circle cx="60" cy="60" r="37" fill={`url(#${uid}-face)`} stroke="#c4a868" strokeWidth="1.1" />
        <circle cx="60" cy="60" r="33.4" fill="none" stroke="#c4a868" strokeOpacity="0.35" strokeWidth="0.6" />

        {/* latitude lines — the ground, surveyed */}
        <ellipse cx="60" cy="60" rx="30" ry="9" fill="none" stroke="#c4a868" strokeOpacity="0.28" strokeWidth="0.6" />
        <ellipse cx="60" cy="50" rx="26" ry="6.5" fill="none" stroke="#c4a868" strokeOpacity="0.16" strokeWidth="0.5" />
        <ellipse cx="60" cy="71" rx="24" ry="5.5" fill="none" stroke="#c4a868" strokeOpacity="0.16" strokeWidth="0.5" />

        {/* the house column, held as the face */}
        <g stroke={`url(#${uid}-gold)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M46 46.5 H74" strokeWidth="1.5" />
          <path d="M49 46.5 V43.2 H71 V46.5" strokeWidth="1.1" />
          <path d="M52.5 43.2 V40.6 H67.5 V43.2" strokeWidth="1" />
          <path d="M51 49.2 V70.2" strokeWidth="1.35" />
          <path d="M60 49.2 V70.2" strokeWidth="1.35" />
          <path d="M69 49.2 V70.2" strokeWidth="1.35" />
          <path d="M47.5 70.2 H72.5" strokeWidth="1.3" />
          <path d="M45.5 73.2 H74.5" strokeWidth="1.6" />
        </g>

        {/* the eye — attention, the leverage */}
        <g style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)` }}>
          <circle cx="60" cy="59" r="6.4" fill="#08131f" stroke="#c4a868" strokeWidth="0.7" />
          <circle cx="60" cy="59" r="3.5" fill={`url(#${uid}-iris)`} />
          <circle cx="60" cy="59" r="1.35" fill="#10253d" />
          <circle cx="58.6" cy="57.7" r="0.9" fill="#fff8e8" opacity="0.9" />
        </g>
      </svg>
      <span className="orb-glow" />
      <style>{`
        .avatar-orb {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .orb-survey {
          fill: none;
          stroke: #c4a868;
          stroke-opacity: 0.18;
          stroke-width: 0.5;
          animation: orb-ring 20s linear infinite;
        }
        .orb-survey.s2 { animation-duration: 16s; animation-direction: reverse; }
        .orb-survey.s3 { animation-duration: 12s; }
        @keyframes orb-ring { to { transform: rotate(360deg); } }

        .orb-sweep {
          fill: none;
          stroke: url(#${uid}-gold);
          stroke-width: 1.2;
          stroke-opacity: 0.55;
          transform-origin: 60px 60px;
          animation: orb-sweep 8s ease-in-out infinite;
        }
        @keyframes orb-sweep {
          0%, 100% { transform: rotate(-15deg); opacity: 0.35; }
          50% { transform: rotate(195deg); opacity: 0.7; }
        }

        .orb-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 40%, rgba(196,168,104,0.18), transparent 70%);
          pointer-events: none;
          animation: orb-glow 4s ease-in-out infinite;
        }
        @keyframes orb-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }

        .avatar-orb.pulse .orb-glow {
          animation: orb-glow 2s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}