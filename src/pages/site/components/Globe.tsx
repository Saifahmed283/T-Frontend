function Globe() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="globe-fill" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#31455B" /><stop offset="1" stopColor="#0C1D30" /></radialGradient>
        <clipPath id="globe-clip"><circle cx="100" cy="100" r="78" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#A98A4B" strokeWidth=".6" strokeDasharray="1 5" />
      <circle cx="100" cy="100" r="78" fill="url(#globe-fill)" />
      <g clipPath="url(#globe-clip)" fill="none" stroke="#C4A868" strokeWidth=".6">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <ellipse key={k} cx="100" cy="100" rx="78" ry="78" opacity=".55">
            <animate attributeName="rx" values="78;0;78" dur="12s" begin={`${-k * 2}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
        {[-52, -26, 0, 26, 52].map((y) => <ellipse key={y} cx="100" cy={100 + y} rx={Math.sqrt(78 * 78 - y * y)} ry={6 - Math.abs(y) / 14} opacity=".45" />)}
      </g>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#C4A868" strokeWidth="1" />
      <g transform="translate(68 64) scale(1)" fill="#FBF8F1">
        <rect x="6" y="0" width="52" height="7" /><rect x="11" y="9" width="42" height="3" />
        {[15, 25, 35, 45].map((x) => <rect key={x} x={x} y="15" width="4" height="48" />)}
        <rect x="9" y="65" width="46" height="3" /><rect x="4" y="70" width="56" height="7" />
      </g>
    </svg>
  )
}

export { Globe }