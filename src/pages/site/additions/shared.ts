/* `auto=format` lets the CDN negotiate AVIF/WebP from the browser's Accept
   header. Forcing `fm=webp` here would opt every visitor out of AVIF. */
export const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?w=${w}&q=60&auto=format&fit=crop`

export const areas = [
  "Local economic development",
  "Policy",
  "TVET & skills",
  "Investment climate",
  "Social enterprise",
]
