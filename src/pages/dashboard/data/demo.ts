import type { ContentItem, ContentStatus } from '@/lib/api'

export const demoActivity: [string, string, string][] = [
  ['2m', 'Procurement pack downloaded', 'Ministry of Planning · governments hub'],
  ['1h', 'G5 gate passed', 'TM-25-031 · Assiut Governorate'],
  ['3h', 'New expert registration', 'Public finance · Amman'],
  ['Yesterday', 'Policy brief published (AR)', 'Investment climate reform'],
  ['Yesterday', 'Risk flagged', 'TM-26-002 · term-sheet delay'],
]

export const demoPipeline = [
  { status: 'DRAFT', count: 12 },
  { status: 'REVIEW', count: 3 },
  { status: 'APPROVED', count: 2 },
  { status: 'SCHEDULED', count: 1 },
  { status: 'PUBLISHED', count: 18 },
  { status: 'UNPUBLISHED', count: 1 },
  { status: 'ARCHIVED', count: 4 },
] as const

export const demoContentCounts: Record<string, { total: number; byStatus: Record<string, number> }> = {
  assignments: { total: 7, byStatus: { DRAFT: 2, REVIEW: 1, APPROVED: 1, PUBLISHED: 3, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  cases: { total: 6, byStatus: { DRAFT: 2, REVIEW: 0, APPROVED: 1, PUBLISHED: 3, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  publications: { total: 9, byStatus: { DRAFT: 3, REVIEW: 1, APPROVED: 0, PUBLISHED: 5, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  instruments: { total: 5, byStatus: { DRAFT: 1, REVIEW: 0, APPROVED: 0, PUBLISHED: 4, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  courses: { total: 3, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 3, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  experts: { total: 8, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 8, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  partners: { total: 4, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 4, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  vacancies: { total: 2, byStatus: { DRAFT: 1, REVIEW: 0, APPROVED: 0, PUBLISHED: 1, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  initiatives: { total: 3, byStatus: { DRAFT: 1, REVIEW: 0, APPROVED: 0, PUBLISHED: 2, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  audiences: { total: 7, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 7, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
  stages: { total: 8, byStatus: { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 8, SCHEDULED: 0, UNPUBLISHED: 0, ARCHIVED: 0 } },
}

export function makeDemoContent(collectionId: string, i: number): ContentItem {
  const title = `${collectionId.replace(/s$/, '')} item ${i + 1}`
  return {
    id: `demo-${collectionId}-${i + 1}`,
    kind: collectionId.toUpperCase(),
    status: ['DRAFT', 'REVIEW', 'PUBLISHED'][i % 3] as ContentStatus,
    slug: `${collectionId}-item-${i + 1}`,
    title,
    data: { title: { en: title } },
    seo: null,
    assignmentId: null,
    sourceReference: null,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    publishedAt: null,
    createdById: null,
    updatedById: null,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - i * 600_000).toISOString(),
  }
}

export function makeDemoItems(collectionId: string, count = 6): ContentItem[] {
  return Array.from({ length: count }, (_, i) => makeDemoContent(collectionId, i))
}