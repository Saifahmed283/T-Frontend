import { useEffect, useState } from "react"
import { LockKeyhole } from "lucide-react"

import { api } from "@/lib/api"

import { Button, Field, Heading, Input, Textarea } from "../ui"

/* Website settings — typed form for contact, legal, social, SEO, hero,
   announcement banner, and navigation order. */

type SocialLinks = {
  linkedin: string
  twitter: string
  youtube: string
  instagram: string
}

type Contact = {
  email: string
  phone: string
  address: string
}

type Legal = {
  companyName: string
  registrationNumber: string
  vatNumber: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
}

type Seo = {
  defaultTitle: string
  defaultDescription: string
  defaultImage: string
  twitterHandle: string
}

type Hero = {
  headline: string
  subheadline: string
  ctaText: string
  ctaUrl: string
  backgroundImage: string
}

type Announcement = {
  enabled: boolean
  message: string
  messageAr: string
  linkText: string
  linkUrl: string
  type: "info" | "warning" | "success"
}

type SiteSettings = {
  contact: Contact
  legal: Legal
  social: SocialLinks
  seo: Seo
  hero: Hero
  announcement: Announcement
  navigation: Array<{ label: string; url: string; order: number }>
}

const defaults: SiteSettings = {
  contact: { email: "", phone: "", address: "" },
  legal: { companyName: "", registrationNumber: "", vatNumber: "", privacyPolicyUrl: "", termsOfServiceUrl: "" },
  social: { linkedin: "", twitter: "", youtube: "", instagram: "" },
  seo: { defaultTitle: "", defaultDescription: "", defaultImage: "", twitterHandle: "" },
  hero: { headline: "", subheadline: "", ctaText: "", ctaUrl: "", backgroundImage: "" },
  announcement: { enabled: false, message: "", messageAr: "", linkText: "", linkUrl: "", type: "info" },
  navigation: [],
}

export function WebsitePage({ canEdit }: { canEdit: boolean }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.siteSettings()
      const data = res.data as SiteSettings
      setSettings({ ...defaults, ...data })
      setUpdatedAt(res.updatedAt)
    } catch {
      setError("Failed to load website settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateField = <K extends keyof SiteSettings>(section: K, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
    setSaved(false)
  }

  const updateAnnouncement = (field: keyof Announcement, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      announcement: { ...prev.announcement, [field]: value },
    }))
    setSaved(false)
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.updateSiteSettings(settings)
      setSettings(res.data as SiteSettings)
      setUpdatedAt(res.updatedAt)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="settings-section">
      <h4 className="settings-section-title">{title}</h4>
      <div className="settings-section-fields">{children}</div>
    </div>
  )

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <Heading level={2}>Website settings</Heading>
          <p>
            Contact, legal identity, social links, default SEO, homepage hero,
            announcement banner, and navigation order.
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
          <LockKeyhole size={12} />
          Only workspace admins and leads can edit website settings.
        </p>
      )}
      {error && (
        <p className="panel-foot is-error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="panel-foot is-ok">Website settings saved.</p>}

      {loading ? (
        <div className="m-4 h-80 animate-pulse rounded-lg border border-line bg-ivory-2" />
      ) : (
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-strong">
              settings.json
            </span>
            {updatedAt && (
              <span className="font-mono text-[10px] text-slate-strong">
                Updated {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>

          {renderSection("Announcement banner", (
            <>
              <Field label="Enabled">
                <input
                  type="checkbox"
                  checked={settings.announcement.enabled}
                  onChange={(e) => updateAnnouncement("enabled", e.target.checked)}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Message (EN)">
                <Input
                  value={settings.announcement.message}
                  onChange={(e) => updateAnnouncement("message", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Announcement text in English"
                />
              </Field>
              <Field label="Message (AR)">
                <Input
                  value={settings.announcement.messageAr}
                  onChange={(e) => updateAnnouncement("messageAr", e.target.value)}
                  disabled={!canEdit}
                  placeholder="نص الإعلان بالعربية"
                />
              </Field>
              <Field label="Link text">
                <Input
                  value={settings.announcement.linkText}
                  onChange={(e) => updateAnnouncement("linkText", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Read more"
                />
              </Field>
              <Field label="Link URL">
                <Input
                  type="url"
                  value={settings.announcement.linkUrl}
                  onChange={(e) => updateAnnouncement("linkUrl", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://example.com"
                />
              </Field>
              <Field label="Type">
                <select
                  value={settings.announcement.type}
                  onChange={(e) => updateAnnouncement("type", e.target.value as Announcement["type"])}
                  disabled={!canEdit}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </Field>
            </>
          ))}

          {renderSection("Contact", (
            <>
              <Field label="Email">
                <Input
                  type="email"
                  value={settings.contact.email}
                  onChange={(e) => updateField("contact", "email", e.target.value)}
                  disabled={!canEdit}
                  placeholder="hello@askterramorph.com"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={settings.contact.phone}
                  onChange={(e) => updateField("contact", "phone", e.target.value)}
                  disabled={!canEdit}
                  placeholder="+20 2 1234 5678"
                />
              </Field>
              <Field label="Address">
                <Input
                  value={settings.contact.address}
                  onChange={(e) => updateField("contact", "address", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Cairo, Egypt"
                />
              </Field>
            </>
          ))}

          {renderSection("Legal", (
            <>
              <Field label="Company name">
                <Input
                  value={settings.legal.companyName}
                  onChange={(e) => updateField("legal", "companyName", e.target.value)}
                  disabled={!canEdit}
                  placeholder="TerraMorph Advisory LLC"
                />
              </Field>
              <Field label="Registration number">
                <Input
                  value={settings.legal.registrationNumber}
                  onChange={(e) => updateField("legal", "registrationNumber", e.target.value)}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="VAT number">
                <Input
                  value={settings.legal.vatNumber}
                  onChange={(e) => updateField("legal", "vatNumber", e.target.value)}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Privacy policy URL">
                <Input
                  type="url"
                  value={settings.legal.privacyPolicyUrl}
                  onChange={(e) => updateField("legal", "privacyPolicyUrl", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://askterramorph.com/privacy"
                />
              </Field>
              <Field label="Terms of service URL">
                <Input
                  type="url"
                  value={settings.legal.termsOfServiceUrl}
                  onChange={(e) => updateField("legal", "termsOfServiceUrl", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://askterramorph.com/terms"
                />
              </Field>
            </>
          ))}

          {renderSection("Social links", (
            <>
              <Field label="LinkedIn">
                <Input
                  type="url"
                  value={settings.social.linkedin}
                  onChange={(e) => updateField("social", "linkedin", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://linkedin.com/company/terramorph"
                />
              </Field>
              <Field label="Twitter / X">
                <Input
                  type="url"
                  value={settings.social.twitter}
                  onChange={(e) => updateField("social", "twitter", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://x.com/terramorph"
                />
              </Field>
              <Field label="YouTube">
                <Input
                  type="url"
                  value={settings.social.youtube}
                  onChange={(e) => updateField("social", "youtube", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://youtube.com/@terramorph"
                />
              </Field>
              <Field label="Instagram">
                <Input
                  type="url"
                  value={settings.social.instagram}
                  onChange={(e) => updateField("social", "instagram", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://instagram.com/terramorph"
                />
              </Field>
            </>
          ))}

          {renderSection("Default SEO", (
            <>
              <Field label="Default title">
                <Input
                  value={settings.seo.defaultTitle}
                  onChange={(e) => updateField("seo", "defaultTitle", e.target.value)}
                  disabled={!canEdit}
                  placeholder="TerraMorph — Leverage for Good"
                />
              </Field>
              <Field label="Default description">
                <Textarea
                  value={settings.seo.defaultDescription}
                  onChange={(e) => updateField("seo", "defaultDescription", e.target.value)}
                  disabled={!canEdit}
                  rows={3}
                  placeholder="Evidence-based advisory for sustainable development."
                />
              </Field>
              <Field label="Default social image">
                <Input
                  type="url"
                  value={settings.seo.defaultImage}
                  onChange={(e) => updateField("seo", "defaultImage", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://askterramorph.com/og-image.png"
                />
              </Field>
              <Field label="Twitter handle">
                <Input
                  value={settings.seo.twitterHandle}
                  onChange={(e) => updateField("seo", "twitterHandle", e.target.value)}
                  disabled={!canEdit}
                  placeholder="@terramorph"
                />
              </Field>
            </>
          ))}

          {renderSection("Homepage hero", (
            <>
              <Field label="Headline">
                <Input
                  value={settings.hero.headline}
                  onChange={(e) => updateField("hero", "headline", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Good content. Lasting impact."
                />
              </Field>
              <Field label="Subheadline">
                <Input
                  value={settings.hero.subheadline}
                  onChange={(e) => updateField("hero", "subheadline", e.target.value)}
                  disabled={!canEdit}
                  placeholder="From the first draft to the published page…"
                />
              </Field>
              <Field label="CTA text">
                <Input
                  value={settings.hero.ctaText}
                  onChange={(e) => updateField("hero", "ctaText", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Explore our work"
                />
              </Field>
              <Field label="CTA URL">
                <Input
                  type="url"
                  value={settings.hero.ctaUrl}
                  onChange={(e) => updateField("hero", "ctaUrl", e.target.value)}
                  disabled={!canEdit}
                  placeholder="/evidence"
                />
              </Field>
              <Field label="Background image">
                <Input
                  type="url"
                  value={settings.hero.backgroundImage}
                  onChange={(e) => updateField("hero", "backgroundImage", e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://askterramorph.com/hero-bg.jpg"
                />
              </Field>
            </>
          ))}

          {renderSection("Navigation order", (
            <p className="text-xs text-slate-strong">
              Navigation ordering is managed via the Audience Hubs page.
            </p>
          ))}
        </div>
      )}
    </section>
  )
}