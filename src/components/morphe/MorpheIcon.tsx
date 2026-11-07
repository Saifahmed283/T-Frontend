/**
 * MorpheIcon - Animated SVG icon for the chatbot.
 * Based on the provided Morphe mark: squircle tile + chat bubble +
 * AI network nodes that pulse like "thinking" / "typing".
 *
 *   <MorpheIcon size={48} thinking={false} />
 *
 * The thinking state triggers the link-pulse and node-bounce
 * animations defined in the SVG's own <style> block.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const SVG = (
  <svg
    width="512"
    height="512"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    dangerouslySetInnerHTML={{
      __html: `
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1D3356"/>
            <stop offset="60%" stop-color="#16263F"/>
            <stop offset="100%" stop-color="#0F1C30"/>
          </linearGradient>
          <radialGradient id="sheen" cx="32%" cy="22%" r="75%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E4C57E"/>
            <stop offset="100%" stop-color="#9E7B3E"/>
          </linearGradient>
        </defs>
        <style>
          .link { stroke: url(#gold); stroke-width: 3; opacity: 0.35;
                  animation: pulse-link 2.4s ease-in-out infinite; }
          .link.l2 { animation-delay: .25s; }
          .link.l3 { animation-delay: .5s; }
          @keyframes pulse-link {
            0%, 100% { opacity: 0.25; }
            50%      { opacity: 0.85; }
          }
          .node { transform-box: fill-box; transform-origin: center;
                  animation: bounce 1.2s ease-in-out infinite; }
          .node.n1 { animation-delay: 0s; }
          .node.n2 { animation-delay: .15s; }
          .node.n3 { animation-delay: .3s; }
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0) scale(1); }
            30%           { transform: translateY(-10px) scale(1.18); }
          }
          .thinking .link { opacity: 0.9; animation-duration: 1.2s; }
          .thinking .node { animation-duration: 0.8s; }
        </style>
        <rect x="8" y="8" width="496" height="496" rx="124" fill="url(#bg)"/>
        <rect x="8" y="8" width="496" height="496" rx="124" fill="url(#sheen)"/>
        <rect x="8.5" y="8.5" width="495" height="495" rx="123.5" fill="none" stroke="#AF8C4B" stroke-opacity="0.35" stroke-width="1"/>
        <path
          d="M 256 120 C 335 120, 392 172, 392 238 C 392 304, 335 356, 256 356 C 233 356, 212 352, 193 344 L 148 368 C 140 372, 132 365, 135 357 L 148 322 C 128 300, 120 270, 120 238 C 120 172, 177 120, 256 120 Z"
          fill="none" stroke="url(#gold)" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"
        />
        <g>
          <line class="link l1" x1="206" y1="238" x2="256" y2="238"/>
          <line class="link l2" x1="256" y1="238" x2="306" y2="238"/>
          <line class="link l3" x1="206" y1="238" x2="306" y2="238" opacity="0.15"/>
          <circle class="node n1" cx="206" cy="238" r="15" fill="url(#gold)"/>
          <circle class="node n2" cx="256" cy="238" r="15" fill="#FBF9F0"/>
          <circle class="node n3" cx="306" cy="238" r="15" fill="url(#gold)"/>
        </g>
      `,
    }}
  />
);

export function MorpheIcon({ size = 48, thinking = false }: { size?: number; thinking?: boolean }) {
  const [mounted, setMounted] = useState(false);

  // Only apply the thinking class after mount so the SVG animations
  // don't trigger a layout shift on first paint.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className={thinking && mounted ? "thinking" : undefined}
        style={{
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D3356"/>
            <stop offset="60%" stopColor="#16263F"/>
            <stop offset="100%" stopColor="#0F1C30"/>
          </linearGradient>
          <radialGradient id="sheen" cx="32%" cy="22%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E4C57E"/>
            <stop offset="100%" stopColor="#9E7B3E"/>
          </linearGradient>
        </defs>
        <style>{`
          .link { stroke: url(#gold); stroke-width: 3; opacity: 0.35;
                  animation: pulse-link 2.4s ease-in-out infinite; }
          .link.l2 { animation-delay: .25s; }
          .link.l3 { animation-delay: .5s; }
          @keyframes pulse-link {
            0%, 100% { opacity: 0.25; }
            50%      { opacity: 0.85; }
          }
          .node { transform-box: fill-box; transform-origin: center;
                  animation: bounce 1.2s ease-in-out infinite; }
          .node.n1 { animation-delay: 0s; }
          .node.n2 { animation-delay: .15s; }
          .node.n3 { animation-delay: .3s; }
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0) scale(1); }
            30%           { transform: translateY(-10px) scale(1.18); }
          }
          .thinking .link { opacity: 0.9; animation-duration: 1s; }
          .thinking .node { animation-duration: 0.6s; }
        `}</style>
        <rect x="8" y="8" width="496" height="496" rx="124" fill="url(#bg)"/>
        <rect x="8" y="8" width="496" height="496" rx="124" fill="url(#sheen)"/>
        <rect x="8.5" y="8.5" width="495" height="495" rx="123.5" fill="none" stroke="#AF8C4B" strokeOpacity="0.35" strokeWidth="1"/>
        <path
          d="M 256 120 C 335 120, 392 172, 392 238 C 392 304, 335 356, 256 356 C 233 356, 212 352, 193 344 L 148 368 C 140 372, 132 365, 135 357 L 148 322 C 128 300, 120 270, 120 238 C 120 172, 177 120, 256 120 Z"
          fill="none" stroke="url(#gold)" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.9"
        />
        <g>
          <line className="link l1" x1="206" y1="238" x2="256" y2="238"/>
          <line className="link l2" x1="256" y1="238" x2="306" y2="238"/>
          <line className="link l3" x1="206" y1="238" x2="306" y2="238" opacity="0.15"/>
          <circle className="node n1" cx="206" cy="238" r="15" fill="url(#gold)"/>
          <circle className="node n2" cx="256" cy="238" r="15" fill="#FBF9F0"/>
          <circle className="node n3" cx="306" cy="238" r="15" fill="url(#gold)"/>
        </g>
      </svg>
    </div>
  );
}
