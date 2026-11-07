/**
 * Data Subject Request types and utilities
 */
export type DataRequestType = 
  | "access"
  | "rectification"
  | "erasure"
  | "restriction"
  | "portability"
  | "objection"
  | "withdraw_consent"

export type DataRequestStatus = "pending" | "in_progress" | "completed" | "rejected"

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
    value: "access",
    label: "Access my data",
    description: "Receive a copy of all personal data we hold about you",
    requiredFields: ["email"],
  },
  {
    value: "rectification",
    label: "Correct my data",
    description: "Update inaccurate or incomplete personal data",
    requiredFields: ["email", "details"],
  },
  {
    value: "erasure",
    label: "Delete my data",
    description: "Request erasure of your personal data (right to be forgotten)",
    requiredFields: ["email", "details"],
  },
  {
    value: "restriction",
    label: "Restrict processing",
    description: "Limit how we process your data while a dispute is resolved",
    requiredFields: ["email"],
  },
  {
    value: "portability",
    label: "Port my data",
    description: "Receive your data in a structured, machine-readable format",
    requiredFields: ["email"],
  },
  {
    value: "objection",
    label: "Object to processing",
    description: "Object to processing based on legitimate interests or direct marketing",
    requiredFields: ["email"],
  },
  {
    value: "withdraw_consent",
    label: "Withdraw consent",
    description: "Withdraw consent for processing that relies on consent",
    requiredFields: ["email"],
  },
]

export const DATA_REQUEST_STATUS_LABELS: Record<DataRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
}

export const DATA_REQUEST_STATUS_LABELS_AR: Record<DataRequestStatus, string> = {
  pending: "قيد المراجعة",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
}

export const DATA_REQUEST_STATUS_TONES: Record<DataRequestStatus, "neutral" | "warning" | "success" | "brand" | "error"> = {
  pending: "warning",
  in_progress: "brand",
  completed: "success",
  rejected: "error",
}

export const DATA_REQUEST_TYPE_LABELS: Record<DataRequestType, string> = {
  access: "Access my data",
  rectification: "Correct my data",
  erasure: "Delete my data",
  restriction: "Restrict processing",
  portability: "Port my data",
  objection: "Object to processing",
  withdraw_consent: "Withdraw consent",
}

export const DATA_REQUEST_TYPE_LABELS_AR: Record<DataRequestType, string> = {
  access: "الوصول إلى بياناتي",
  rectification: "تصحيح بياناتي",
  erasure: "حذف بياناتي",
  restriction: "تقييد المعالجة",
  portability: "نقل بياناتي",
  objection: "الاعتراض على المعالجة",
  withdraw_consent: "سحب الموافقة",
}

export const DATA_REQUEST_TYPE_DESCRIPTIONS: Record<DataRequestType, string> = {
  access: "Receive a copy of all personal data we hold about you",
  rectification: "Update inaccurate or incomplete personal data",
  erasure: "Request erasure of your personal data (right to be forgotten)",
  restriction: "Limit how we process your data while a dispute is resolved",
  portability: "Receive your data in a structured, machine-readable format",
  objection: "Object to processing based on legitimate interests or direct marketing",
  withdraw_consent: "Withdraw consent for processing that relies on consent",
}

export const DATA_REQUEST_TYPE_DESCRIPTIONS_AR: Record<DataRequestType, string> = {
  access: "الحصول على نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك",
  rectification: "تحديث البيانات الشخصية غير الدقيقة أو غير المكتملة",
  erasure: "طلب حذف بياناتك الشخصية (حق النسيان)",
  restriction: "تقييد كيفية معالجة بياناتك أثناء حل النزاع",
  portability: "استلام بياناتك بصيغة منظمة وقابلة للقراءة آليًا",
  objection: "الاعتراض على المعالجة المبنية على المصالح المشروعة أو التسويق المباشر",
  withdraw_consent: "سحب الموافقة للمعالجة التي تعتمد على الموافقة",
}

export function getRequiredFields(type: DataRequestType): string[] {
  const config = DATA_REQUEST_TYPES.find(t => t.value === type)
  return config?.requiredFields ?? ["email"]
}

export function isFieldRequired(type: DataRequestType, field: string): boolean {
  return getRequiredFields(type).includes(field)
}