# Terramorph — Phase 1: User Research & Friction Analysis

Scope: the client portal (`src/pages/dashboard/Dashboard.tsx`) and the interactive additions
(`src/pages/site/additions/` — `PrivilegeToggle`, `JoinBoard`, `WhatsNew`). Audience: enterprise
tenant administrators, organizational operators, and technical operator tenants.

This document is the research half of the UX refactor. The implementation half lives in the
staged UI work (design tokens, `src/components/ui/` primitives, the Dashboard "Command Deck",
and the `PrivilegeToggle` interaction).

## 1. Friction points in multi-tenant data transitions

### F1 — Tenant-context amnesia
`Dashboard.tsx` renders per-workspace aggregates but historically carried no explicit tenant
chrome: no visible workspace switcher, no role indicator, no "last synced" caption. Data is
already scoped server-side (`GET /api/v1/dashboard/summary` uses the caller's `workspaceId`),
so the risk is not wrong data — it is the operator attributing correctly-scoped data to the
wrong tenant. On a dense page this produces silent, high-cost errors.

**Signal to watch:** the user scrolls back to a metric and asks "which client is this again?"

### F2 — Status semantics without a causal narrative
Assignment rows render `stage` (G0–G7) and `status` (`ON_TRACK`/`AT_RISK`/`BLOCKED`) as
passive labels. The backend records the *why* (`GET /api/v1/activity` — `NOTE_ADDED` and
friends), but a status label compresses away the delta that an operator actually acts on.
Dense-but-unexplained data reads as noise.

### F3 — Privilege flows with no preview or undo
The CV-registration wizard in `JoinBoard` is one-way (`setStep(step + 1)` with only "Start
over"), and access-tier changes had no confirmation or reversal. In a strict least-privilege
model, privilege changes are the highest-stakes action in the product; treating them as
throwaway form steps invites accidental escalation and lost work.

## 2. Heuristic evaluation checklist (Nielsen's 10)

Severity: **🔴 Blocker** · **🟠 Major** · **🟡 Minor**

| # | Principle | Terramorph-specific check | Sev |
|---|-----------|---------------------------|-----|
| 1 | Visibility of system status | Live tenant badge, `generatedAt`/synced caption, skeleton (not empty) states on every async region | 🔴 |
| 2 | Match system & real world | Use the backend's own vocabulary: `ON_TRACK/AT_RISK/BLOCKED`, `G0–G7`, `roster`, `NOTE_ADDED` | 🟠 |
| 3 | User control & freedom | Undo window on privilege/tier changes; wizard "Back" rehydrates prior answers | 🔴 |
| 4 | Consistency & standards | One toggle/badge pattern across role pills, tabs, filters, and tier controls | 🟠 |
| 5 | Error prevention | Confirm affordance or hold-to-arm on privilege changes; no dead `#` links | 🟡 |
| 6 | Recognition over recall | Empty states name the next action; global search reaches tenants/assignments too | 🟠 |
| 7 | Flexibility & efficiency | Keyboard route to the tenant switcher; saved filter presets ("last 30 days") | 🟡 |
| 8 | Aesthetic & minimalist | Gold reserved for attention/active; never low-contrast body text on ivory | 🟠 |
| 9 | Error recovery | Map API errors (`UNAUTHENTICATED`, `NOT_FOUND`) to human, retryable messages | 🔴 |
| 10 | Help & documentation | Inline scope tooltips ("least-privilege = DML only, no DDL") | 🟡 |

## 3. Contextual interview questions — Tenant Administrators

1. "Walk me through the last time you changed a user's access or invited a workspace member.
   Where did you stop to double-check, and what would have removed that hesitation?"
2. "When you approve a role or feature-tier change, what does 'done correctly' look like — and
   how would you want the system to prove it took effect (audit trail, immediate diff, dry run)?"
3. "If a colleague accidentally removed or elevated a privilege, what recovery path do you
   expect, and how many steps should 'undo' take before you would rather contact support?"

## 4. Research to implementation mapping

| Finding | Implementation | Location |
|---------|----------------|----------|
| F1 | Workspace switcher + role `Badge` + synced caption | `Dashboard.tsx` context bar |
| F2 | Portfolio pulse (status + G0–G7), activity rail, KPI delta chips | `Dashboard.tsx` |
| F3 | Hold-to-arm 600ms → impact preview → 3s undo | `additions/PrivilegeToggle.tsx` |
| A11y | Live regions, dialog focus trap, focus-visible rings, reduced-motion | `components/ui/`, `styles/index.css` |
