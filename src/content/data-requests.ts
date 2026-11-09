/**
 * Data Subject Request types and utilities
 */
export type DataRequestType =
  | "ACCESS"
  | "RECTIFICATION"
  | "ERASURE"
  | "RESTRICTION"
  | "PORTABILITY"
  | "OBJECTION"
  | "WITHDRAW_CONSENT"

export type DataRequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED"

export interface DataSubjectRequest {
  id: string
  type: DataRequestType
  email: string
  name?: string
  details?: string
  status: DataRequestStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
  response?: string
  verificationToken?: string
  verifiedAt?: string
  timeline?: DataRequestTimelineEvent[]
}

export interface DataRequestTimelineEvent {
  id: string
  status: DataRequestStatus
  message: string
  createdAt: string
  actor?: string
}

export const DATA_REQUEST_TYPES: { value: DataRequestType; label: string; description: string; requiredFields: string[] }[] = [
  {
    value: "ACCESS",
    label: "Access my data",
    description: "Receive a copy of all personal data we hold about you",
    requiredFields: ["email"],
  },
  {
    value: "RECTIFICATION",
    label: "Correct my data",
    description: "Update inaccurate or incomplete personal data",
    requiredFields: ["email", "details"],
  },
  {
    value: "ERASURE",
    label: "Delete my data",
    description: "Request erasure of your personal data (right to be forgotten)",
    requiredFields: ["email", "details"],
  },
  {
    value: "RESTRICTION",
    label: "Restrict processing",
    description: "Limit how we process your data while a dispute is resolved",
    requiredFields: ["email"],
  },
  {
    value: "PORTABILITY",
    label: "Port my data",
    description: "Receive your data in a structured, machine-readable format",
    requiredFields: ["email"],
  },
  {
    value: "OBJECTION",
    label: "Object to processing",
    description: "Object to processing based on legitimate interests or direct marketing",
    requiredFields: ["email"],
  },
  {
    value: "WITHDRAW_CONSENT",
    label: "Withdraw consent",
    description: "Withdraw consent for processing that relies on consent",
    requiredFields: ["email"],
  },
]

export const DATA_REQUEST_STATUS_LABELS: Record<DataRequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
}

export const DATA_REQUEST_STATUS_LABELS_AR: Record<DataRequestStatus, string> = {
  PENDING: "قيد المراجعة",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  REJECTED: "مرفوض",
}

export const DATA_REQUEST_STATUS_TONES: Record<DataRequestStatus, "neutral" | "warning" | "success" | "brand" | "error"> = {
  PENDING: "warning",
  IN_PROGRESS: "brand",
  COMPLETED: "success",
  REJECTED: "error",
}

export const DATA_REQUEST_TYPE_LABELS: Record<DataRequestType, string> = {
  ACCESS: "Access my data",
  RECTIFICATION: "Correct my data",
  ERASURE: "Delete my data",
  RESTRICTION: "Restrict processing",
  PORTABILITY: "Port my data",
  OBJECTION: "Object to processing",
  WITHDRAW_CONSENT: "Withdraw consent",
}

export const DATA_REQUEST_TYPE_LABELS_AR: Record<DataRequestType, string> = {
  ACCESS: "الوصول إلى بياناتي",
  RECTIFICATION: "تصحيح بياناتي",
  ERASURE: "حذف بياناتي",
  RESTRICTION: "تقييد المعالجة",
  PORTABILITY: "نقل بياناتي",
  OBJECTION: "الاعتراض على المعالجة",
  WITHDRAW_CONSENT: "سحب الموافقة",
}

export const DATA_REQUEST_TYPE_DESCRIPTIONS: Record<DataRequestType, string> = {
  ACCESS: "Receive a copy of all personal data we hold about you",
  RECTIFICATION: "Update inaccurate or incomplete personal data",
  ERASURE: "Request erasure of your personal data (right to be forgotten)",
  RESTRICTION: "Limit how we process your data while a dispute is resolved",
  PORTABILITY: "Receive your data in a structured, machine-readable format",
  OBJECTION: "Object to processing based on legitimate interests or direct marketing",
  WITHDRAW_CONSENT: "Withdraw consent for processing that relies on consent",
}

export const DATA_REQUEST_TYPE_DESCRIPTIONS_AR: Record<DataRequestType, string> = {
  ACCESS: "الحصول على نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك",
  RECTIFICATION: "تحديث البيانات الشخصية غير الدقيقة أو غير المكتملة",
  ERASURE: "طلب حذف بياناتك الشخصية (حق النسيان)",
  RESTRICTION: "تقييد كيفية معالجة بياناتك أثناء حل النزاع",
  PORTABILITY: "استلام بياناتك بصيغة منظمة وقابلة للقراءة آليًا",
  OBJECTION: "الاعتراض على المعالجة المبنية على المصالح المشروعة أو التسويق المباشر",
  WITHDRAW_CONSENT: "سحب الموافقة للمعالجة التي تعتمد على الموافقة",
}

export function getRequiredFields(type: DataRequestType): string[] {
  const config = DATA_REQUEST_TYPES.find((t) => t.value === type)
  return config?.requiredFields ?? ["email"]
}

export function isFieldRequired(type: DataRequestType, field: string): boolean {
  return getRequiredFields(type).includes(field)
}
