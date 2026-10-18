export type SectionId = "for" | "evidence" | "cause" | "knowledge" | "learning" | "about" | "join-board" | "contact"

/**
 * Real path routes for every in-page section, so navigation never mutates a
 * `#hash`. `/method` serves the cause exhibition, `/about` the "who we are"
 * section, `/join` the join board and `/contact` the conversation section.
 */
export const SECTION_ROUTES: Record<string, SectionId> = {
  "/for": "for",
  "/evidence": "evidence",
  "/method": "cause",
  "/knowledge": "knowledge",
  "/learning": "learning",
  "/about": "about",
  "/join": "join-board",
  "/contact": "contact",
}

export const SECTION_PATHS: Record<SectionId, string> = {
  for: "/for",
  evidence: "/evidence",
  cause: "/method",
  knowledge: "/knowledge",
  learning: "/learning",
  about: "/about",
  "join-board": "/join",
  contact: "/contact",
}

export function sectionForPath(path: string): SectionId | null {
  return SECTION_ROUTES[path] ?? null
}

export function pathForSection(id: SectionId): string {
  return SECTION_PATHS[id]
}
