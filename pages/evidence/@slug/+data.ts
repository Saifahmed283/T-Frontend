import type { PageContextServer } from "vike/types"

import { fetchDetailMeta } from "@/content/publicRoutes"

export default async function data(pageContext: PageContextServer) {
  const meta = await fetchDetailMeta("/evidence", pageContext.routeParams.slug)

  return { detail: meta }
}
