/**
 * Shared validation helpers for every form on the site.
 *
 * Validators return an error message string when the value is invalid and
 * `null` when it is valid. Messages are available in English and Arabic so
 * that a form never leaks the wrong language.
 */

import type { Lang } from "@/pages/site/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s()./-]{7,20}$/
export const PASSWORD_MIN_LENGTH = 12

type MessagePair = { en: string; ar: string }

function msg(pair: MessagePair, lang: Lang): string {
  return lang === "ar" ? pair.ar : pair.en
}

/* ------------------------------------------------------------------ */
/*  Messages                                                          */
/* ------------------------------------------------------------------ */

export const VALIDATION_MESSAGES = {
  emailRequired: { en: "Email is required.", ar: "البريد الإلكتروني مطلوب." },
  emailInvalid: {
    en: "Please enter a valid email address.",
    ar: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
  },
  passwordRequired: { en: "Password is required.", ar: "كلمة المرور مطلوبة." },
  passwordTooShort: {
    en: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    ar: `يجب أن تتكوّن كلمة المرور من ${PASSWORD_MIN_LENGTH} حرفًا على الأقل.`,
  },
  passwordMismatch: {
    en: "Passwords do not match.",
    ar: "كلمتا المرور غير متطابقتين.",
  },
  nameRequired: { en: "Please enter your name.", ar: "يرجى إدخال اسمك." },
  nameTooShort: {
    en: "Please enter at least 2 characters.",
    ar: "يرجى إدخال حرفين على الأقل.",
  },
  messageRequired: {
    en: "Please tell us what you need.",
    ar: "يرجى إخبارنا بما تحتاجه.",
  },
  messageTooShort: {
    en: "Please add a little more detail (at least 10 characters).",
    ar: "يرجى إضافة مزيد من التفاصيل (10 أحرف على الأقل).",
  },
  phoneInvalid: {
    en: "Please enter a valid phone number.",
    ar: "يرجى إدخال رقم هاتف صحيح.",
  },
  urlInvalid: {
    en: "Please enter a valid link starting with https://",
    ar: "يرجى إدخال رابط صحيح يبدأ بـ https://",
  },
  termsRequired: {
    en: "Please accept the Privacy Policy and Terms of Service to continue.",
    ar: "يرجى قبول سياسة الخصوصية وشروط الخدمة للمتابعة.",
  },
  consentRequired: {
    en: "Please confirm your choice to continue.",
    ar: "يرجى تأكيد اختيارك للمتابعة.",
  },
  confirmationRequired: {
    en: "Please confirm this is your own request and the details are accurate.",
    ar: "يرجى تأكيد أن هذا الطلب خاص بك وأن التفاصيل صحيحة.",
  },
  selectRequired: {
    en: "Please choose an option.",
    ar: "يرجى اختيار خيار.",
  },
  checkAtLeastOne: {
    en: "Please select at least one option.",
    ar: "يرجى اختيار خيار واحد على الأقل.",
  },
  invalidValue: {
    en: "Please check this value.",
    ar: "يرجى التحقق من هذه القيمة.",
  },
} satisfies Record<string, MessagePair>

/* ------------------------------------------------------------------ */
/*  Validators                                                        */
/* ------------------------------------------------------------------ */

export function validateEmail(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return msg(VALIDATION_MESSAGES.emailRequired, lang)
  if (!EMAIL_RE.test(text)) return msg(VALIDATION_MESSAGES.emailInvalid, lang)
  return null
}

export function validateOptionalEmail(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return null
  return validateEmail(text, lang)
}

export function validatePassword(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value : ""
  if (text.trim().length === 0) return msg(VALIDATION_MESSAGES.passwordRequired, lang)
  if (text.length < PASSWORD_MIN_LENGTH) return msg(VALIDATION_MESSAGES.passwordTooShort, lang)
  return null
}

export function validatePasswordMatch(
  password: unknown,
  confirm: unknown,
  lang: Lang = "en",
): string | null {
  const a = typeof password === "string" ? password : ""
  const b = typeof confirm === "string" ? confirm : ""
  if (b.trim().length === 0) return msg(VALIDATION_MESSAGES.passwordRequired, lang)
  if (a !== b) return msg(VALIDATION_MESSAGES.passwordMismatch, lang)
  return null
}

export function validateName(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return msg(VALIDATION_MESSAGES.nameRequired, lang)
  if (text.length < 2) return msg(VALIDATION_MESSAGES.nameTooShort, lang)
  return null
}

export function validateMessage(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return msg(VALIDATION_MESSAGES.messageRequired, lang)
  if (text.length < 10) return msg(VALIDATION_MESSAGES.messageTooShort, lang)
  return null
}

export function validateOptionalPhone(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return null
  if (!PHONE_RE.test(text)) return msg(VALIDATION_MESSAGES.phoneInvalid, lang)
  return null
}

export function validateOptionalUrl(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return null
  if (!/^https?:\/\/[^\s]+$/i.test(text)) return msg(VALIDATION_MESSAGES.urlInvalid, lang)
  return null
}

export function validateRequiredText(value: unknown, lang: Lang = "en"): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (text.length === 0) return msg(VALIDATION_MESSAGES.selectRequired, lang)
  return null
}

export function validateTerms(value: unknown, lang: Lang = "en"): string | null {
  return value === true ? null : msg(VALIDATION_MESSAGES.termsRequired, lang)
}

export function validateConsent(value: unknown, lang: Lang = "en"): string | null {
  return value === true ? null : msg(VALIDATION_MESSAGES.consentRequired, lang)
}

export function validateConfirmation(
  value: unknown,
  lang: Lang = "en",
): string | null {
  return value === true
    ? null
    : msg(VALIDATION_MESSAGES.confirmationRequired, lang)
}

export function validateAtLeastOne(
  value: unknown,
  lang: Lang = "en",
): string | null {
  return Array.isArray(value) && value.length > 0
    ? null
    : msg(VALIDATION_MESSAGES.checkAtLeastOne, lang)
}

/* ------------------------------------------------------------------ */
/*  Password strength (advisory only — not a gate)                     */
/* ------------------------------------------------------------------ */

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: { en: string; ar: string }
}

export function passwordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= PASSWORD_MIN_LENGTH) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels: Array<{ en: string; ar: string }> = [
    { en: "Too weak", ar: "ضعيفة جدًا" },
    { en: "Weak", ar: "ضعيفة" },
    { en: "Fair", ar: "متوسطة" },
    { en: "Good", ar: "جيدة" },
    { en: "Strong", ar: "قوية" },
  ]

  return { score: score as PasswordStrength["score"], label: labels[score] }
}
