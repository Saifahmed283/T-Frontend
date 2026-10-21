import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  FileCheck2,
  FolderOpen,
  Globe2,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  ListFilter,
  LockKeyhole,
  Menu,
  Network,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  api,
  ApiError,
  type ActivityItem,
  type Asset,
  type ContentCounts,
  type ContentItem,
  type Member,
  type MemberRole,
  type Submission,
  type SubmissionKind,
  type WorkflowBoardPayload,
} from "@/lib/api"
import { useWorkspace } from "./hooks/useWorkspace"
import "@/styles/dashboard.css"
import { useCollection } from "./hooks/useCollection"
import { collections, type Collection } from "./content-model"
import {
  Badge,
  Button,
  Field,
  Heading,
  Input,
  Modal,
  Select,
  Textarea,
} from "./ui"
import { ContentEditor } from "./ContentEditor"

const collectionIcons: Record<string, LucideIcon> = {
  assignments: BriefcaseBusiness,
  cases: FolderOpen,
  publications: BookOpen,
  instruments: Network,
  courses: FileCheck2,
  experts: Users,
  partners: Globe2,
  vacancies: BriefcaseBusiness,
  initiatives: Sparkles,
  audiences: Users,
  stages: Workflow,
}

const navGroups: {
  title: string
  items: {
    id: string
    label: string
    icon: LucideIcon
    expandable?: boolean
  }[]
}[] = [
  {
    title: "WORKSPACE",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "content", label: "Content", icon: FolderOpen, expandable: true },
      { id: "media", label: "Media library", icon: ImageIcon },
      { id: "workflow", label: "Publishing workflow", icon: Workflow },
    ],
  },
  {
    title: "WEBSITE",
    items: [
      { id: "website", label: "Website settings", icon: LayoutTemplate },
      { id: "audiences", label: "Audience hubs", icon: Users },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "submissions", label: "Submissions", icon: Inbox },
      { id: "users", label: "Users & roles", icon: ShieldCheck },
      { id: "activity", label: "Activity log", icon: Clock3 },
      { id: "settings", label: "Settings", icon: Settings2 },
    ],
  },
]

const pageNames: Record<string, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((i) => [i.id, i.label])),
)
for (const c of collections) pageNames[c.id] = c.name

const kindLabel: Record<SubmissionKind, string> = {
  CONTACT: "Contact",
  EXPERT_REGISTRATION: "Expert",
  SEAT_RESERVATION: "Seat",
  TENDER_INTEREST: "Tender",
  TEAM_PROPOSAL: "Team",
  JOB_APPLICATION: "Job",
  PUBLICATION_REQUEST: "Publication",
  NEWSLETTER: "Newsletter",
  CONTRIBUTION: "Contribution",
}

const statusOrder = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
] as const

function statusTone(
  status: string,
): "neutral" | "warning" | "success" | "brand" {
  if (status === "PUBLISHED") return "success"
  if (status === "APPROVED" || status === "SCHEDULED") return "brand"
  if (status === "REVIEW" || status === "UNPUBLISHED") return "warning"
  return "neutral"
}

const statusLabel = (key: string) =>
  key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " ")

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function IconTile({
  icon: Icon,
  small = false,
}: {
  icon: LucideIcon
  small?: boolean
}) {
  return (
    <span className={`icon-tile ${small ? "small" : ""}`}>
      <Icon size={small ? 17 : 20} strokeWidth={1.6} />
    </span>
  )
}

function Empty({
  icon: Icon = Database,
  title,
  children,
  action,
}: {
  icon?: LucideIcon
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={25} strokeWidth={1.4} />
      </span>
      <Heading level={3}>{title}</Heading>
      <p>{children}</p>
      {action}
    </div>
  )
}

function SignInPage({
  onLogin,
  checking,
  notice,
}: {
  onLogin: (email: string, password: string) => Promise<void>
  checking: boolean
  notice?: string
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr("")
    try {
      await onLogin(email, password)
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Sign-in failed")
      setBusy(false)
    }
  }
  return (
    <div className="tm-workspace">
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="wordmark">
              TERRAMORPH<span className="brand-period">.</span>
            </div>
            <div className="brand-subline">CONTENT WORKSPACE</div>
          </div>
          <Heading level={2}>Sign in</Heading>
          <p className="auth-lead">
            This workspace is private. Sign in with your TerraMorph account to
            manage content, media and submissions.
          </p>
          <form onSubmit={submit}>
            <Field label="Email" required>
              <Input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@askterramorph.com"
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {err && (
              <p role="alert" className="auth-error text-error">
                {err}
              </p>
            )}
            {notice && !err && (
              <p role="status" className="auth-error text-error">
                {notice}
              </p>
            )}
            <Button
              variant="primary"
              type="submit"
              className="auth-submit"
              disabled={busy || checking}
            >
              <LockKeyhole size={15} />
              {busy
                ? "Signing in…"
                : checking
                  ? "Checking session…"
                  : "Sign in"}
            </Button>
          </form>
          <p className="auth-foot">
            TerraMorph <span className="footer-dot">·</span> Leverage for Good.
          </p>
        </div>
      </div>
    </div>
  )
}

export function Workspace() {
  const { data, loading, error, needsAuth, reload, login, logout } =
    useWorkspace()

  const [page, setPage] = useState("overview")
  const [contentOpen, setContentOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [modal, setModal] =
    useState<"search" | "help" | "notifications" | "create" | null>(null)
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

  const counts = data?.contentCounts ?? null
  const currentCollection = collections.find((c) => c.id === page)
  const isCollectionPage = Boolean(currentCollection) && page !== "content"

  const navigate = (id: string) => {
    setPage(id)
    setMobileNav(false)
    setQuery("")
  }
  const openEditor = (collectionId: string, itemId?: string) => {
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

  /* Never render the authenticated shell without a confirmed session. A non-401
     probe failure (network, CORS, backend unreachable) settles with data=null
     and needsAuth=false; that used to fall through and show the full admin
     chrome to unauthenticated visitors. Treat "no session" as needing auth and
     surface the probe error on the sign-in screen so the state is truthful. */
  if (!data) {
    return (
      <SignInPage
        onLogin={login}
        checking={loading && !needsAuth}
        notice={!loading && !needsAuth && error ? error : undefined}
      />
    )
  }

  return (
    <div className="tm-workspace">
      <div className="app-shell">
        {mobileNav && (
          <div className="nav-scrim" onClick={() => setMobileNav(false)} />
        )}
        <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
          <div className="brand">
            <div className="wordmark">
              TERRAMORPH<span className="brand-period">.</span>
            </div>
            <div className="brand-subline">CONTENT WORKSPACE</div>
          </div>

          <div className="workspace-selector">
            <span className="workspace-monogram">T</span>
            <div>
              <strong>TerraMorph Advisory</strong>
              <span>Live workspace</span>
            </div>
            <LockKeyhole size={14} />
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
                      onClick={() => {
                        navigate(item.id)
                        if (item.id === "content") setContentOpen(!contentOpen)
                      }}
                    >
                      <item.icon size={18} strokeWidth={1.65} />
                      <span>{item.label}</span>
                      {item.expandable && (
                        <ChevronDown
                          size={14}
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
              <CircleHelp size={18} />
              Help & documentation
              <ArrowUpRight size={15} />
            </Button>
            <div className="session-card">
              <span className="session-icon">
                <LockKeyhole size={18} />
              </span>
              <div>
                <strong>{data?.session?.user.name ?? "Workspace"}</strong>
                <span>{data?.session?.role ?? "member"}</span>
              </div>
              <Button
                variant="ghost"
                className="icon-button"
                aria-label="Sign out"
                title="Sign out"
                onClick={() => void logout()}
              >
                <X size={16} />
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
                <Menu size={20} />
              </Button>
              <span className="desktop-breadcrumb">Workspace</span>
              <ChevronRight size={14} />
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
                <Search size={17} />
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
                <ArrowUpRight size={16} />
              </Button>
              <Button
                variant="ghost"
                className="icon-button notification-button"
                onClick={() => setModal("notifications")}
                aria-label="Notifications"
              >
                <Bell size={19} />
              </Button>
              <span className="preview-avatar" title="Signed in">
                <LockKeyhole size={15} />
              </span>
            </div>
          </header>

          <main>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  TERRAMORPH CMS <span>/</span> {heading.eyebrow}
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
                <Plus size={17} />
                {currentCollection
                  ? `Add ${currentCollection.singular.toLowerCase()}`
                  : "Create content"}
                <ChevronDown size={14} />
              </Button>
            </div>

            {error && (
              <div className="connection-notice" role="alert">
                <Database size={16} />
                <p>
                  <strong>Could not load workspace data.</strong> {error}
                </p>
                <Button variant="ghost" onClick={() => void reload()}>
                  Retry
                  <ArrowRight size={15} />
                </Button>
              </div>
            )}

            {loading && !data ? (
              <div className="metric-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="metric-card">
                    <div className="h-4 w-24 animate-pulse bg-ivory-2" />
                    <div className="mt-4 h-8 w-16 animate-pulse bg-ivory-2" />
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
                onOpenEditor={openEditor}
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
                onOpenItem={openEditor}
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
                <LockKeyhole size={12} />
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
                    <ChevronRight size={16} />
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
                <Search size={18} />
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
                      <FolderOpen size={16} />
                      {c.name}
                      <ArrowRight size={15} />
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

      {editor && (
        <ContentEditor
          collection={
            collections.find((c) => c.id === editor.collectionId) as Collection
          }
          itemId={editor.itemId}
          isApprover={data?.isApprover ?? false}
          onClose={closeEditor}
          onSaved={afterSave}
        />
      )}
    </div>
  )
}

function OverviewPage({
  counts,
  activity,
  onNavigate,
  onOpenEditor,
}: {
  counts: ContentCounts | null
  activity: ActivityItem[]
  onNavigate: (id: string) => void
  onOpenEditor: (collectionId: string) => void
}) {
  const metrics: {
    name: string
    icon: LucideIcon
    detail: string
    id: string
    value: number
  }[] = [
    {
      name: "Assignments",
      icon: BriefcaseBusiness,
      detail: "Your delivery track record",
      id: "assignments",
      value: counts?.byKind?.assignments?.total ?? 0,
    },
    {
      name: "Case studies",
      icon: FolderOpen,
      detail: "Evidence ready to share",
      id: "cases",
      value: counts?.byKind?.cases?.total ?? 0,
    },
    {
      name: "Publications",
      icon: BookOpen,
      detail: "Knowledge in the making",
      id: "publications",
      value: counts?.byKind?.publications?.total ?? 0,
    },
    {
      name: "Instruments",
      icon: Network,
      detail: "Methods in practice",
      id: "instruments",
      value: counts?.byKind?.instruments?.total ?? 0,
    },
  ]
  const pipeline = [
    { status: "DRAFT", label: "Draft" },
    { status: "REVIEW", label: "In review" },
    { status: "APPROVED", label: "Approved" },
    { status: "PUBLISHED", label: "Published" },
  ] as const

  return (
    <>
      <section className="welcome-banner">
        <div className="banner-copy">
          <div className="eyebrow">GOOD CONTENT. LASTING IMPACT.</div>
          <Heading level={2}>Your evidence, connected.</Heading>
          <p>
            From the first draft to the published page.
            <br />
            One place to manage the TerraMorph story.
          </p>
          <Button
            className="banner-link"
            variant="ghost"
            onClick={() => {
              onNavigate("content")
            }}
          >
            Explore your content
            <ArrowRight size={16} />
          </Button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-grid" />
          <span className="art-node node-one" />
          <span className="art-node node-two" />
          <span className="art-node node-three" />
          <span className="art-node node-four" />
          <div className="art-line line-one" />
          <div className="art-line line-two" />
          <div className="art-line line-three" />
          <span className="art-caption">KNOWLEDGE → EVIDENCE → IMPACT</span>
        </div>
        <span className="banner-tag">THE CONTENT ECOSYSTEM</span>
      </section>

      <div className="connection-notice">
        <span className="notice-mark">
          <Database size={16} />
        </span>
        <p>
          <strong>Live workspace connected.</strong> Edits you save here are
          written to the content API and become available to the public site.
        </p>
      </div>

      <div className="section-label">
        <span>CONTENT AT A GLANCE</span>
        <span className="live-label">
          <span className="complete-dot" />
          Live
        </span>
      </div>

      <div className="metric-grid">
        {metrics.map((m) => (
          <Button
            variant="ghost"
            className="metric-card"
            key={m.id}
            onClick={() => onNavigate(m.id)}
          >
            <div className="metric-top">
              <span>{m.name}</span>
              <m.icon size={19} strokeWidth={1.5} />
            </div>
            <strong className="metric-value">{m.value}</strong>
            <div className="metric-bottom">
              <span>{m.detail}</span>
              <ArrowUpRight size={15} />
            </div>
          </Button>
        ))}
      </div>

      <div className="dashboard-columns">
        <div className="content-column">
          <section className="panel collections-panel">
            <div className="panel-heading">
              <div>
                <Heading level={2}>Content collections</Heading>
                <p>The building blocks of your website.</p>
              </div>
              <Button
                variant="ghost"
                className="text-link"
                onClick={() => onNavigate("content")}
              >
                View all
                <ArrowRight size={15} />
              </Button>
            </div>
            <div className="collection-table">
              <div className="collection-table-head">
                <span>COLLECTION</span>
                <span>RECORDS</span>
                <span>LANGUAGES</span>
                <span />
              </div>
              {collections.slice(0, 5).map((c) => (
                <Button
                  variant="ghost"
                  className="collection-row"
                  key={c.id}
                  onClick={() => onNavigate(c.id)}
                >
                  <div className="collection-title">
                    <IconTile small icon={collectionIcons[c.id]} />
                    <div>
                      <strong>{c.name}</strong>
                      <span>{c.description}</span>
                    </div>
                  </div>
                  <span className="record-count">
                    {counts?.byKind?.[c.id]?.total ?? 0}
                  </span>
                  <div className="language-pills">
                    <span>EN</span>
                    <span>AR</span>
                  </div>
                  <ChevronRight size={15} />
                </Button>
              ))}
            </div>
            <div className="panel-foot">
              <LockKeyhole size={13} />
              <span>Records are read from the content API.</span>
            </div>
          </section>

          <section className="panel workflow-panel">
            <div className="panel-heading">
              <div>
                <Heading level={2}>Publishing pipeline</Heading>
                <p>A considered path from draft to public.</p>
              </div>
              <Workflow size={19} strokeWidth={1.5} />
            </div>
            <div className="pipeline">
              {pipeline.map((s, i) => (
                <div className="pipeline-step" key={s.status}>
                  <div className={`pipeline-dot step-${i}`} />
                  <strong>{counts?.byStatus?.[s.status] ?? 0}</strong>
                  <span>{s.label}</span>
                  {i < pipeline.length - 1 && (
                    <ChevronRight className="pipeline-arrow" size={15} />
                  )}
                </div>
              ))}
            </div>
            <div className="pipeline-footer">
              <span>
                <Clock3 size={14} />
                Schedule publishes from any record
              </span>
              <Button
                variant="ghost"
                className="text-link"
                onClick={() => onNavigate("workflow")}
              >
                View workflow
                <ArrowRight size={14} />
              </Button>
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="panel activity-panel">
            <div className="panel-heading">
              <Heading level={2}>Recent activity</Heading>
              <Button
                variant="ghost"
                className="icon-button"
                aria-label="View activity log"
                onClick={() => onNavigate("activity")}
              >
                <ArrowUpRight size={17} />
              </Button>
            </div>
            {activity.length > 0 ? (
              <ul className="activity-list">
                {activity.slice(0, 4).map((a) => (
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
            ) : (
              <Empty icon={Clock3} title="Your story starts here">
                Edits, reviews and publishing activity will appear here.
              </Empty>
            )}
          </section>

          <section className="publishing-card">
            <div className="publishing-card-title">
              <ShieldCheck size={20} strokeWidth={1.5} />
              <span>PUBLISH WITH CONFIDENCE</span>
            </div>
            <Heading level={2}>
              A little care.
              <br />A stronger publication.
            </Heading>
            <div className="checklist">
              {[
                "Add English and Arabic content",
                "Connect related evidence",
                "Verify sources and permissions",
                "Preview, review, then publish",
              ].map((s, i) => (
                <div key={s}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={() => onOpenEditor("cases")}>
              Start a case study
              <ArrowUpRight size={15} />
            </Button>
          </section>
        </div>
      </div>

      <div className="network-strip">
        <div>
          <Users size={20} strokeWidth={1.5} />
          <span>
            <strong>Your network, in one place</strong>
            <span>Manage people, partnerships and learning.</span>
          </span>
        </div>
        {[
          { name: "Courses", id: "courses" },
          { name: "Experts", id: "experts" },
          { name: "Partners", id: "partners" },
        ].map((item) => (
          <Button
            variant="ghost"
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.name}</span>
            <strong>{counts?.byKind?.[item.id]?.total ?? 0}</strong>
            <ArrowUpRight size={14} />
          </Button>
        ))}
      </div>
    </>
  )
}

function ContentPage({
  collections: list,
  counts,
  query,
  setQuery,
  group,
  setGroup,
  sort,
  setSort,
  onNavigate,
}: {
  collections: Collection[]
  counts: ContentCounts | null
  query: string
  setQuery: (v: string) => void
  group: string
  setGroup: (v: string) => void
  sort: string
  setSort: (v: string) => void
  onNavigate: (id: string) => void
  onOpenEditor: (collectionId: string) => void
}) {
  return (
    <section className="panel">
      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={17} />
          <Input
            aria-label="Search collections"
            placeholder="Search content collections…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          aria-label="Filter collection group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {[
            "All collections",
            "Evidence",
            "Knowledge",
            "Network",
            "Website",
          ].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
        <Select
          aria-label="Sort collections"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Default order</option>
          <option value="az">Name A–Z</option>
          <option value="za">Name Z–A</option>
        </Select>
      </div>
      <div className="collection-grid">
        {list.map((c) => (
          <Button
            variant="ghost"
            className="collection-card"
            key={c.id}
            onClick={() => onNavigate(c.id)}
          >
            <IconTile icon={collectionIcons[c.id]} />
            <Badge>{c.group}</Badge>
            <Heading level={3}>{c.name}</Heading>
            <p>{c.description}</p>
            <span className="collection-card-foot">
              {counts?.byKind?.[c.id]?.total ?? 0} records · Manage
              <ArrowRight size={16} />
            </span>
          </Button>
        ))}
      </div>
      {!list.length && (
        <Empty icon={Search} title="No matching collections">
          Try a different search or collection group.
        </Empty>
      )}
    </section>
  )
}

function CollectionPage({
  collection,
  counts,
  onOpenItem,
  onCreate,
}: {
  collection: Collection
  counts: ContentCounts | null
  onOpenItem: (itemId: string) => void
  onCreate: () => void
}) {
  const {
    items,
    loading,
    status,
    setStatus,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
  } = useCollection(collection.id)
  const [filters, setFilters] = useState(false)
  const byStatus = counts?.byKind?.[collection.id]?.byStatus

  const tabs: {
    key: string
    label: string
  }[] = [
    { key: "All", label: "All content" },
    { key: "DRAFT", label: "Draft" },
    { key: "REVIEW", label: "Review" },
    { key: "APPROVED", label: "Approved" },
    { key: "PUBLISHED", label: "Published" },
    { key: "ARCHIVED", label: "Archived" },
  ]

  return (
    <section className="panel">
      <div className="status-tabs">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant="ghost"
            className={(status ?? "All") === t.key ? "selected" : ""}
            onClick={() =>
              setStatus(t.key === "All" ? undefined : t.key as never)
            }
          >
            {t.label}
            <span>
              {t.key === "All"
                ? (counts?.byKind?.[collection.id]?.total ?? 0)
                : (byStatus?.[t.key] ?? 0)}
            </span>
          </Button>
        ))}
      </div>

      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={17} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${collection.name.toLowerCase()}…`}
            aria-label={`Search ${collection.name}`}
          />
        </div>
        <Button onClick={() => setFilters(!filters)}>
          <ListFilter size={16} />
          Filters{filters && <Check size={14} />}
        </Button>
      </div>

      {filters && (
        <div className="expanded-filters">
          <Field label="Language">
            <Select>
              <option>All languages</option>
              <option>English</option>
              <option>Arabic</option>
            </Select>
          </Field>
          <Field label="Geography">
            <Input placeholder="Filter by geography" />
          </Field>
          <Field label="Sector">
            <Input placeholder="Filter by sector" />
          </Field>
        </div>
      )}

      <div className="records-table-head">
        <span>TITLE</span>
        <span>STATUS</span>
        <span>LANGUAGES</span>
        <span>LAST UPDATED</span>
      </div>

      {loading ? (
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-line px-4 py-4"
            >
              <div className="h-4 w-48 animate-pulse bg-ivory-2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty
          icon={collectionIcons[collection.id]}
          title={`No ${collection.name.toLowerCase()} yet`}
          action={
            <Button className="mt-4" onClick={onCreate}>
              <Plus size={16} />
              Add {collection.singular.toLowerCase()}
            </Button>
          }
        >
          Create your first record to see it here.
        </Empty>
      ) : (
        <div>
          {items.map((it) => (
            <Button
              variant="ghost"
              key={it.id}
              onClick={() => onOpenItem(it.id)}
              className="item-row"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{it.title || "Untitled"}</p>
                <p className="truncate text-xs text-slate">/{it.slug}</p>
              </div>
              <div>
                <Badge tone={statusTone(it.status)}>{it.status}</Badge>
              </div>
              <div className="language-pills">
                <span>EN</span>
                <span>AR</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate">
                <span>{new Date(it.updatedAt).toLocaleDateString()}</span>
                <ChevronRight size={15} />
              </div>
            </Button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="panel-foot" style={{ justifyContent: "space-between" }}>
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

function WorkflowPage({
  board,
  onOpenItem,
}: {
  board: WorkflowBoardPayload | null
  onOpenItem: (collectionId: string, itemId: string) => void
}) {
  const columns = board?.columns ?? {}
  const keys = statusOrder.filter((s) => columns[s] !== undefined)
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>From draft to publication</Heading>
          <p>Every record, grouped by where it sits in the workflow.</p>
        </div>
        <Workflow size={19} strokeWidth={1.5} />
      </div>
      <div className="workflow-board">
        {(keys.length ? keys : statusOrder.slice(0, 4)).map((key) => {
          const items: ContentItem[] = columns[key] ?? []
          return (
            <div key={key}>
              <Heading level={3}>
                {statusLabel(key)}
                <span>{items.length}</span>
              </Heading>
              {items.length === 0 ? (
                <div className="board-empty">Nothing here yet</div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => onOpenItem(it.kind.toLowerCase(), it.id)}
                      className="w-full rounded border border-line bg-ivory px-3 py-3 text-left transition hover:border-gold-strong"
                    >
                      <p className="text-sm font-medium">
                        {it.title || "Untitled"}
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        {statusLabel(it.kind)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.assets({
        search: search || undefined,
        pageSize: 60,
      })
      setAssets(res.items)
      setStorageEnabled(res.storageEnabled)
    } catch {
      setError("Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const upload = async (file: File) => {
    setBusy(true)
    try {
      await api.assetUpload(file)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const remove = async (id: string) => {
    setBusy(true)
    try {
      await api.assetDelete(id)
      setAssets((a) => a.filter((x) => x.id !== id))
    } catch {
      setError("Delete failed")
    } finally {
      setBusy(false)
    }
  }

  const setAlt = async (asset: Asset, lang: "en" | "ar", value: string) => {
    const alt = { ...(asset.alt ?? {}), [lang]: value }
    setAssets((a) => a.map((x) => (x.id === asset.id ? { ...x, alt } : x)))
    try {
      await api.assetUpdateAlt(asset.id, alt)
    } catch {
      setError("Could not save alt text")
    }
  }

  return (
    <section className="panel">
      <div className="collection-toolbar">
        <div className="search-field">
          <Search size={17} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            aria-label="Search media"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
        <Button
          variant="primary"
          disabled={busy || !storageEnabled}
          onClick={() => inputRef.current?.click()}
        >
          <Plus size={16} /> Upload
        </Button>
      </div>

      {!storageEnabled && (
        <p className="panel-foot is-error">
          Storage is not configured on this environment, so uploads stay
          disabled.
        </p>
      )}
      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="collection-grid">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Empty icon={ImageIcon} title="No files yet">
          Upload images and documents to reuse them across your content.
        </Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <li key={a.id} className="border border-line bg-ivory">
              <div className="flex h-32 items-center justify-center border-b border-line bg-ivory-2">
                {a.mimeType.startsWith("image/") ? (
                  <img
                    src={a.url}
                    alt={a.alt?.en ?? a.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={28} className="text-slate" />
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium" title={a.filename}>
                  {a.filename}
                </p>
                <p className="text-xs text-slate">{formatSize(a.size)}</p>
                <Field label="Alt (EN)">
                  <Input
                    value={a.alt?.en ?? ""}
                    onChange={(e) => void setAlt(a, "en", e.target.value)}
                    placeholder="Describe the image"
                  />
                </Field>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(a.id)}
                  className="text-xs hover:underline text-error disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function WebsitePage({ canEdit }: { canEdit: boolean }) {
  const [text, setText] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.siteSettings()
      setText(JSON.stringify(res.data ?? {}, null, 2))
      setUpdatedAt(res.updatedAt)
    } catch {
      setError("Failed to load website settings")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text || "{}")
    } catch {
      setError("Settings must be valid JSON")
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.updateSiteSettings(parsed)
      setUpdatedAt(res.updatedAt)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Website settings</Heading>
          <p>
            Contact, legal identity, social links, default SEO and navigation
            order.
          </p>
        </div>
        <Button
          variant="primary"
          disabled={busy || !canEdit}
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </div>
      {!canEdit && (
        <p className="panel-foot">
          Only workspace admins can edit website settings.
        </p>
      )}
      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="panel-foot is-ok">Website settings saved.</p>}
      {loading ? (
        <div className="m-4 h-80 w-full animate-pulse border border-line bg-ivory-2" />
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-slate">
            <span>settings.json</span>
            {updatedAt && (
              <span>Updated {new Date(updatedAt).toLocaleString()}</span>
            )}
          </div>
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setSaved(false)
            }}
            disabled={!canEdit}
            spellCheck={false}
            rows={22}
            className="json-area"
          />
        </>
      )}
    </section>
  )
}

function SubmissionsPage({
  submissions,
  isAdmin,
}: {
  submissions: Submission[] | null
  isAdmin: boolean
}) {
  const [kind, setKind] = useState<"All" | SubmissionKind>("All")
  const kindsPresent = useMemo(() => {
    const set = new Set<SubmissionKind>()
    for (const s of submissions ?? []) set.add(s.kind)
    return Array.from(set)
  }, [submissions])

  if (!isAdmin) {
    return (
      <div className="panel">
        <Empty icon={Inbox} title="Submissions are private">
          Sign in as an admin to read incoming contact, tender and registration
          submissions.
        </Empty>
      </div>
    )
  }
  const rows = (submissions ?? []).filter(
    (s) => kind === "All" || s.kind === kind,
  )
  return (
    <section className="panel">
      <div className="status-tabs">
        <Button
          variant="ghost"
          className={kind === "All" ? "selected" : ""}
          onClick={() => setKind("All")}
        >
          All <span>{submissions?.length ?? 0}</span>
        </Button>
        {kindsPresent.map((k) => (
          <Button
            key={k}
            variant="ghost"
            className={kind === k ? "selected" : ""}
            onClick={() => setKind(k)}
          >
            {kindLabel[k]}
          </Button>
        ))}
      </div>
      {rows.length === 0 ? (
        <Empty icon={Inbox} title="Nothing here yet">
          New submissions from the public site will appear here.
        </Empty>
      ) : (
        <ul>
          {rows.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-medium">{s.name ?? "Anonymous"}</p>
                <p className="text-xs text-slate">{s.email ?? "—"}</p>
              </div>
              <Badge>{kindLabel[s.kind]}</Badge>
              <p className="hidden max-w-md flex-1 truncate text-sm text-slate md:block">
                {s.message ?? "—"}
              </p>
              <span className="text-xs text-slate">{timeAgo(s.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function UsersPage({ canEdit }: { canEdit: boolean }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.members()
      setMembers(res.items)
    } catch {
      setError("Failed to load members")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setRole = async (m: Member, role: MemberRole) => {
    setMembers((list) =>
      list.map((x) => (x.userId === m.userId ? { ...x, role } : x)),
    )
    try {
      await api.updateMemberRole(m.userId, role)
    } catch {
      setError("Could not update role")
      void load()
    }
  }

  const tone: Record<MemberRole, "brand" | "warning" | "neutral"> = {
    admin: "brand",
    lead: "warning",
    member: "neutral",
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Users & roles</Heading>
          <p>Who can access this workspace and what they can do.</p>
        </div>
        <ShieldCheck size={19} strokeWidth={1.5} />
      </div>
      {error ? (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      ) : loading ? (
        <div className="p-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="mb-3 h-12 w-full animate-pulse border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <Empty icon={Users} title="Only you so far">
          Invite teammates from your account settings to collaborate here.
        </Empty>
      ) : (
        <ul>
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 last:border-0"
            >
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-slate">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={tone[m.role]}>{m.role}</Badge>
                <Select
                  value={m.role}
                  disabled={!canEdit}
                  onChange={(e) =>
                    void setRole(m, e.target.value as MemberRole)
                  }
                  aria-label={`Role for ${m.name}`}
                >
                  <option value="admin">Admin</option>
                  <option value="lead">Lead</option>
                  <option value="member">Member</option>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ActivityPage({
  items,
  loading,
}: {
  items: ActivityItem[]
  loading: boolean
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Activity log</Heading>
          <p>The audit trail across the workspace.</p>
        </div>
        <Clock3 size={19} strokeWidth={1.5} />
      </div>
      {loading ? (
        <div className="p-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-3 h-12 w-full animate-pulse border border-line bg-ivory-2"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty icon={Clock3} title="No activity yet">
          Actions across content, assignments and members will be recorded here.
        </Empty>
      ) : (
        <ul className="activity-list">
          {items.map((a) => (
            <li key={a.id}>
              <span>{timeAgo(a.createdAt)}</span>
              <div>
                <p>{a.message}</p>
                <p className="field-hint">
                  {[a.user?.name, a.assignment?.name]
                    .filter(Boolean)
                    .join(" · ") || a.type}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SettingsPage({
  session,
}: {
  session: {
    user: {
      name: string
      email: string
    }
    workspace: { slug: string }
    role: string
  } | null
}) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const changePassword = async () => {
    if (next.length < 8)
      return setError("New password must be at least 8 characters")
    if (next !== confirm) return setError("New passwords do not match")
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      await api.changePassword(current, next)
      setDone(true)
      setCurrent("")
      setNext("")
      setConfirm("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change password")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard-columns">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <Heading level={2}>Workspace</Heading>
            <p>Workspace and account details.</p>
          </div>
        </div>
        <dl className="modal-body">
          {[
            ["Workspace", session?.workspace.slug ?? "—"],
            ["Signed in as", session?.user.name ?? "—"],
            ["Email", session?.user.email ?? "—"],
            ["Role", session?.role ?? "member"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-4 border-b border-line py-3 last:border-0"
            >
              <dt className="text-slate">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <Heading level={2}>Change password</Heading>
            <p>Update the password for your account.</p>
          </div>
        </div>
        <div className="modal-body">
          <Field label="Current password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <Field label="New password" required hint="At least 8 characters.">
            <Input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password" required>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="text-error">
              {error}
            </p>
          )}
          {done && <p className="text-ok">Password updated.</p>}
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => void changePassword()}
          >
            {busy ? "Updating…" : "Update password"}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Workspace
