function Globe() {
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
      <circle
        cx="100"
        cy="100"
        r="96"
        fill="none"
        stroke="#A98A4B"
        strokeWidth=".6"
        strokeDasharray="1 5"
      />
      <circle cx="100" cy="100" r="78" fill="url(#globe-fill)" />
      <g
        clipPath="url(#globe-clip)"
        fill="none"
        stroke="#C4A868"
        strokeWidth=".6"
      >
        {/* Static meridians. These used to be six SMIL `<animate>` loops
            cycling `rx` from 78 → 0 → 78 forever, which forces the browser to
            re-rasterise the whole SVG on every frame for as long as the section
            is on screen. Drawn as real meridian ellipses instead: same wireframe
            read, zero ongoing cost. */}
        {[72, 55, 38, 20].map((rx) => (
          <ellipse
            key={rx}
            cx="100"
            cy="100"
            rx={rx}
            ry="78"
            opacity=".5"
          />
        ))}
        {[-52, -26, 0, 26, 52].map((y) => (
          <ellipse
            key={y}
            cx="100"
            cy={100 + y}
            rx={Math.sqrt(78 * 78 - y * y)}
            ry={6 - Math.abs(y) / 14}
            opacity=".45"
          />
        ))}
      </g>
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="#C4A868"
        strokeWidth="1"
      />
      <g transform="translate(68 64) scale(1)" fill="#FBF8F1">
        <rect x="6" y="0" width="52" height="7" />
        <rect x="11" y="9" width="42" height="3" />
        {[15, 25, 35, 45].map((x) => (
          <rect key={x} x={x} y="15" width="4" height="48" />
        ))}
        <rect x="9" y="65" width="46" height="3" />
        <rect x="4" y="70" width="56" height="7" />
      </g>
    </svg>
  )
}

export { Globe }
