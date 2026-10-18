import { usePageContext } from "vike-react/usePageContext"
import SitePage from "@/pages/site/SitePage"

export default function Page() {
  const { routeParams } = usePageContext()
  return <SitePage page={routeParams.slug as string} />
}
