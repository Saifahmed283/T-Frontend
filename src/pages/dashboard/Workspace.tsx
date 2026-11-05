import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  FolderOpen,
  LockKeyhole,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react"

import { useWorkspace } from "./hooks/useWorkspace"
import "@/styles/dashboard.css"
import { collections, type Collection } from "./content-model"
import { Button, Heading, Input, Modal } from "./ui"
import { ContentEditor } from "./ContentEditor"
import {
  collectionIcons,
  collectionIdByKind,
  Empty,
  IconTile,
  initials,
  navGroups,
  pageNames,
  timeAgo,
} from "./shared"
import { OverviewPage } from "./pages/Overview"
import { ContentPage } from "./pages/Content"
import { CollectionPage } from "./pages/Collection"
import { WorkflowPage } from "./pages/Workflow"
import { MediaPage } from "./pages/Media"
import { WebsitePage } from "./pages/Website"
import { SubmissionsPage } from "./pages/Submissions"
import { UsersPage } from "./pages/Users"
import { ActivityPage } from "./pages/Activity"
import { SettingsPage } from "./pages/Settings"

/* Workspace — the authenticated shell at /dashboard.

   Only the chrome lives here: the navy spine, the topbar, the page heading and
   the global modals. Each page owns its own layout under ./pages. The session
   probe runs once in pages/dashboard/+Page.tsx and is passed in, so the shell
   never fires a second round of requests and there is no signed-out branch to
   keep in sync. */

export function Workspace({ ws }: { ws: ReturnType<typeof useWorkspace> }) {
  const { data, loading, error, reload, logout } = ws

  const [page, setPage] = useState("overview")
  const [contentOpen, setContentOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] = useState<
    "search" | "help" | "notifications" | "create" | null
  >(null)
  const [editor, setEditor] = useState<{
    collectionId: string
    itemId?: string
  } | null>(null)
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState("All collections")
  const [sort, setSort] = useState("default")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !editor &&
        !modal
      ) {
        event.preventDefault()
        setQuery("")
        setModal("search")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editor, modal])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNav(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const counts = data?.contentCounts ?? null
  const currentCollection = collections.find((c) => c.id === page)
  const isCollectionPage = Boolean(currentCollection) && page !== "content"

  const navigate = (id: string) => {
    setPage(id)
    setMobileNav(false)
    setQuery("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openEditor = (collectionId: string, itemId?: string) => {
    if (!collections.some((c) => c.id === collectionId)) return
    setEditor({ collectionId, itemId })
    setModal(null)
  }
  const closeEditor = () => setEditor(null)
  const afterSave = () => {
    setEditor(null)
    void reload()
  }

  const visibleCollections = useMemo(() => {
    let list = collections.filter(
      (c) =>
        `${c.name} ${c.description}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (group === "All collections" || c.group === group),
    )
    if (sort !== "default")
      list = [...list].sort((a, b) =>
        sort === "az"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      )
    return list
  }, [query, group, sort])

  const heading = currentCollection
    ? {
        eyebrow: currentCollection.group.toUpperCase(),
        title: currentCollection.name,
        body: currentCollection.description,
      }
    : page === "overview"
      ? {
          eyebrow: "YOUR WORKSPACE, AT A GLANCE",
          title: "Workspace overview",
          body: "A clear view of your content, your workflow, and what comes next.",
        }
      : {
          eyebrow: "WEBSITE MANAGEMENT",
          title: pageNames[page] ?? page,
          body: "Manage your website in one thoughtfully organised workspace.",
        }

  const sessionName = data?.session?.user.name ?? "Workspace"
  const sessionRole = data?.session?.role ?? "member"

  return (
    <div className="tm-workspace">
      <div className="app-shell">
        {mobileNav && (
          <div className="nav-scrim" onClick={() => setMobileNav(false)} />
        )}

        <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
          <div className="brand">
            <img
              className="brand-logo"
              src="/logo.svg"
              alt="TerraMorph"
              width={152}
              height={52}
            />
            <div className="brand-subline">Content workspace</div>
          </div>

          <div className="workspace-selector">
            <span className="workspace-monogram">T</span>
            <div>
              <strong>TerraMorph Advisory</strong>
              <span>Live workspace</span>
            </div>
            <LockKeyhole size={13} />
          </div>

          <nav aria-label="Dashboard navigation">
            {navGroups.map((g) => (
              <div className="nav-group" key={g.title}>
                <div className="nav-label">{g.title}</div>
                {g.items.map((item) => (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      className={`nav-item ${
                        page === item.id ||
                        (item.id === "content" &&
                          currentCollection &&
                          currentCollection.id !== "audiences")
                          ? "active"
                          : ""
                      }`}
                      aria-current={page === item.id ? "page" : undefined}
                      onClick={() => {
                        navigate(item.id)
                        if (item.id === "content") setContentOpen(!contentOpen)
                      }}
                    >
                      <item.icon size={17} strokeWidth={1.6} />
                      <span>{item.label}</span>
                      {item.expandable && (
                        <ChevronDown
                          size={13}
                          className={contentOpen ? "rotate" : ""}
                        />
                      )}
                    </Button>

                    {item.id === "content" && contentOpen && (
                      <div className="nav-submenu">
                        {collections
                          .filter((c) => c.id !== "audiences")
                          .map((c) => (
                            <Button
                              key={c.id}
                              variant="ghost"
                              className={page === c.id ? "sub-active" : ""}
                              onClick={() => navigate(c.id)}
                            >
                              {c.name}
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <Button
              variant="ghost"
              className="help-link"
              onClick={() => setModal("help")}
            >
              <CircleHelp size={17} />
              Help & documentation
            </Button>

            <div className="session-card">
              <span className="session-avatar">{initials(sessionName)}</span>
              <div>
                <strong>{sessionName}</strong>
                <span>{sessionRole}</span>
              </div>
              <Button
                variant="ghost"
                className="icon-button"
                aria-label="Sign out"
                title="Sign out"
                onClick={() => void logout()}
              >
                <X size={15} />
              </Button>
            </div>
          </div>
        </aside>

        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <Button
                className="icon-button mobile-menu"
                variant="ghost"
                aria-label="Open navigation"
                onClick={() => setMobileNav(true)}
              >
                <Menu size={19} />
              </Button>
              <span className="desktop-breadcrumb">Workspace</span>
              <ChevronRight size={13} />
              <span>{heading.title}</span>
            </div>

            <div className="topbar-actions">
              <Button
                variant="ghost"
                className="global-search"
                onClick={() => {
                  setQuery("")
                  setModal("search")
                }}
              >
                <Search size={15} />
                <span>Search workspace</span>
                <kbd>⌘ K</kbd>
              </Button>
              <span className="topbar-divider" />
              <Button
                variant="ghost"
                className="view-website"
                onClick={() => window.open("/", "_blank")}
              >
                View website
                <ArrowRight size={14} />
              </Button>
              <Button
                variant="ghost"
                className="icon-button notification-button"
                onClick={() => setModal("notifications")}
                aria-label="Notifications"
              >
                <Bell size={18} />
              </Button>
              <span className="preview-avatar" title={`Signed in as ${sessionName}`}>
                {initials(sessionName)}
              </span>
            </div>
          </header>

          <main>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  TerraMorph CMS <span>/</span> {heading.eyebrow}
                </div>
                <Heading level={1}>{heading.title}</Heading>
                <p>{heading.body}</p>
              </div>
              <Button
                variant="primary"
                onClick={() =>
                  currentCollection
                    ? openEditor(currentCollection.id)
                    : setModal("create")
                }
              >
                <Plus size={16} />
                {currentCollection
                  ? `Add ${currentCollection.singular.toLowerCase()}`
                  : "Create content"}
                <ChevronDown size={13} />
              </Button>
            </div>

            {error && (
              <div className="connection-notice" role="alert">
                <Database size={15} />
                <p>
                  <strong>Could not load workspace data.</strong> {error}
                </p>
                <Button variant="ghost" onClick={() => void reload()}>
                  Retry
                  <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {loading && !data ? (
              <div className="metric-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="metric-card">
                    <div className="h-3 w-24 animate-pulse rounded bg-ivory-2" />
                    <div className="mt-4 h-8 w-16 animate-pulse rounded bg-ivory-2" />
                  </div>
                ))}
              </div>
            ) : page === "overview" ? (
              <OverviewPage
                counts={counts}
                activity={data?.activity.items ?? []}
                onNavigate={navigate}
                onOpenEditor={openEditor}
              />
            ) : page === "content" ? (
              <ContentPage
                collections={visibleCollections}
                counts={counts}
                query={query}
                setQuery={setQuery}
                group={group}
                setGroup={setGroup}
                sort={sort}
                setSort={setSort}
                onNavigate={navigate}
              />
            ) : isCollectionPage && currentCollection ? (
              <CollectionPage
                collection={currentCollection}
                counts={counts}
                onOpenItem={(itemId) =>
                  openEditor(currentCollection.id, itemId)
                }
                onCreate={() => openEditor(currentCollection.id)}
              />
            ) : page === "workflow" ? (
              <WorkflowPage
                board={data?.workflowBoard ?? null}
                onOpenItem={(item) => {
                  const collectionId = collectionIdByKind[item.kind]
                  if (collectionId) openEditor(collectionId, item.id)
                }}
              />
            ) : page === "media" ? (
              <MediaPage />
            ) : page === "website" ? (
              <WebsitePage canEdit={data?.isAdmin ?? false} />
            ) : page === "submissions" ? (
              <SubmissionsPage
                submissions={data?.submissions ?? null}
                isAdmin={data?.isAdmin ?? false}
              />
            ) : page === "users" ? (
              <UsersPage canEdit={data?.isAdmin ?? false} />
            ) : page === "activity" ? (
              <ActivityPage
                items={data?.activity.items ?? []}
                loading={loading}
              />
            ) : (
              <SettingsPage session={data?.session ?? null} />
            )}

            <footer className="main-footer">
              <span>
                TerraMorph <span className="footer-dot">·</span> Leverage for
                Good.
              </span>
              <span>
                <LockKeyhole size={11} />
                Live workspace <span className="footer-dot">·</span> Signed in
              </span>
            </footer>
          </main>
        </div>

        {modal === "create" && (
          <Modal
            title="What would you like to create?"
            onClose={() => setModal(null)}
            wide
          >
            <div className="modal-body">
              <p>
                Choose a collection. You can save drafts and move records
                through the publishing workflow.
              </p>
              <div className="create-options">
                {collections.map((c) => (
                  <Button
                    variant="ghost"
                    key={c.id}
                    onClick={() => openEditor(c.id)}
                  >
                    <IconTile icon={collectionIcons[c.id]} />
                    <div>
                      <strong>{c.singular}</strong>
                      <span>{c.description}</span>
                    </div>
                    <ChevronRight size={15} />
                  </Button>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {modal === "search" && (
          <Modal title="Search workspace" onClose={() => setModal(null)}>
            <div className="modal-body">
              <div className="search-field modal-search">
                <Search size={17} />
                <Input
                  autoFocus
                  placeholder="Find a collection…"
                  aria-label="Find a collection"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="search-results">
                {collections
                  .filter((c) =>
                    c.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((c) => (
                    <Button
                      variant="ghost"
                      key={c.id}
                      onClick={() => {
                        navigate(c.id)
                        setModal(null)
                      }}
                    >
                      <FolderOpen size={15} />
                      {c.name}
                      <ArrowRight size={14} />
                    </Button>
                  ))}
              </div>
            </div>
          </Modal>
        )}

        {modal === "notifications" && (
          <Modal title="Notifications" onClose={() => setModal(null)}>
            {data?.activity.items && data.activity.items.length > 0 ? (
              <div className="modal-body">
                <ul className="activity-list">
                  {data.activity.items.slice(0, 8).map((a) => (
                    <li key={a.id}>
                      <span>{timeAgo(a.createdAt)}</span>
                      <div>
                        <p>{a.message}</p>
                        {(a.user || a.assignment) && (
                          <p className="field-hint">
                            {[a.user?.name, a.assignment?.name]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Empty icon={Bell} title="No notifications yet">
                Review requests, scheduled publications and system alerts will
                appear here.
              </Empty>
            )}
          </Modal>
        )}

        {modal === "help" && (
          <Modal title="Your publishing guide" onClose={() => setModal(null)}>
            <div className="modal-body">
              <p>
                Good evidence is structured, bilingual and reviewed. Follow this
                sequence for every new case study.
              </p>
              <ol className="guide-list">
                <li>
                  <strong>Prepare the evidence</strong>
                  <p>
                    Add the client, mandate, constraint, work delivered,
                    outcomes and measurement. Include a verifiable source.
                  </p>
                </li>
                <li>
                  <strong>Add both languages</strong>
                  <p>
                    English and Arabic belong to one record. Review each
                    translation separately.
                  </p>
                </li>
                <li>
                  <strong>Review before publishing</strong>
                  <p>
                    Request review, obtain approval and verify publication
                    permission before moving a record to Published.
                  </p>
                </li>
              </ol>
            </div>
          </Modal>
        )}
      </div>

      {editor &&
        (() => {
          const collection = collections.find((c) => c.id === editor.collectionId)
          if (!collection) return null
          return (
            <ContentEditor
              collection={collection}
              itemId={editor.itemId}
              isApprover={data?.isApprover ?? false}
              onClose={closeEditor}
              onSaved={afterSave}
            />
          )
        })()}
    </div>
  )
}

export default Workspace
