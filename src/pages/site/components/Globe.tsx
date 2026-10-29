function Globe() {
  const main = "#FBF8F1"

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="globe-fill" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#31455B" />
          <stop offset="1" stopColor="#0C1D30" />
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="100" cy="100" r="78" />
        </clipPath>
      </defs>
      {/* Outer gold ring (subtle) */}
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="none"
        stroke="#A98A4B"
        strokeWidth=".4"
        strokeDasharray="1 6"
        opacity=".5"
      />
      {/* Navy globe fill */}
      <circle cx="100" cy="100" r="78" fill="url(#globe-fill)" />
      {/* Faint meridians inside navy — minimal, low opacity */}
      <g clipPath="url(#globe-clip)" fill="none" stroke="#C4A868" strokeWidth=".3" opacity=".35">
        {[55, 38, 20].map((rx) => (
          <ellipse key={rx} cx="100" cy="100" rx={rx} ry="78" />
        ))}
        {[-26, 0, 26].map((y) => (
          <ellipse
            key={y}
            cx="100"
            cy={100 + y}
            rx={Math.sqrt(78 * 78 - y * y)}
            ry={6 - Math.abs(y) / 14}
          />
        ))}
      </g>
      {/* Outer stroke — very thin */}
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="#C4A868"
        strokeWidth=".5"
        opacity=".4"
      />
      {/* Brand emblem at center — scaled to fill the navy circle, centered at (100,100) */}
      <g transform="translate(100 100) scale(2.2) translate(-32 -32)">
        <circle cx="32" cy="32" r="30" fill="none" stroke={main} strokeWidth="1.5" />
        <circle cx="32" cy="32" r="26" fill="none" stroke="#A98A4B" strokeWidth="0.7" />
        <ellipse cx="32" cy="32" rx="12" ry="26" fill="none" stroke="#A98A4B" strokeWidth="0.5" opacity=".6" />
        <line x1="6" y1="32" x2="58" y2="32" fill="none" stroke="#A98A4B" strokeWidth="0.5" opacity=".6" />
        <rect x="22" y="16" width="20" height="3" fill={main} />
        <rect x="24" y="19.5" width="16" height="1.5" fill={main} />
        {[25.5, 29.5, 33.5, 37.5].map((x) => (
          <rect key={x} x={x} y="22" width="1.6" height="22" fill={main} />
        ))}
        <rect x="23" y="44.5" width="18" height="1.5" fill={main} />
        <rect x="21" y="46.5" width="22" height="3" fill={main} />
      </g>
    </svg>
  )
}

export { Globe }