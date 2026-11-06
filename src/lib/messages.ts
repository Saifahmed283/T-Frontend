/**
 * Central message catalog for TerraMorph.
 *
 * One source of truth for user-facing copy. Keep tone consistent:
 * - What happened (plain language)
 * - What to do next (actionable)
 * - No technical jargon unless it's a support reference
 */

export type Tone = "error" | "warning" | "success" | "info";

export interface ToastOptions {
  tone: Tone;
  title: string;
  body?: string;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
}

export interface AlertOptions {
  tone: Tone;
  title: string;
  body?: string;
  retry?: () => void;
  retryLabel?: string;
  dismissible?: boolean;
}

const AR_MESSAGES: Record<string, { en: string; ar: string }> = {
  // Auth
  "auth.invalid_credentials": {
    en: "Email or password is incorrect. Check both and try again.",
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة. تحقّق من كليهما وحاول مرة أخرى.",
  },
  "auth.account_locked": {
    en: "Too many failed attempts. Try again in {minutes} minute(s).",
    ar: "محاولات فاشلة كثيرة. حاول مرة أخرى خلال {minutes} دقيقة.",
  },
  "auth.rate_limited": {
    en: "Too many requests. Wait a moment and retry.",
    ar: "طلبات كثيرة جداً. انتظر لحظة وأعد المحاولة.",
  },
  "auth.unauthenticated": {
    en: "Your session has expired. Please sign in again.",
    ar: "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.",
  },
  "auth.forbidden": {
    en: "You don't have permission to do that.",
    ar: "ليس لديك صلاحية للقيام بذلك.",
  },
  "auth.csrf_blocked": {
    en: "Security check failed. Refresh the page and try again.",
    ar: "فشل فحص الأمان. أعد تحميل الصفحة وحاول مرة أخرى.",
  },
  "auth.no_workspace": {
    en: "Your account has no workspace access. Contact an admin.",
    ar: "حسابك ليس لديه حق الوصول لمساحة العمل. تواصل مع مسؤول.",
  },
  "auth.no_password": {
    en: "This account has no password set. Use the reset link sent to your email.",
    ar: "هذا الحساب ليس له كلمة مرور. استخدم رابط إعادة التعيين المرسل إلى بريدك.",
  },
  "auth.invalid_reset_token": {
    en: "This password reset link is invalid or has expired. Request a new one.",
    ar: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.",
  },
  "auth.password_too_short": {
    en: "Password must be at least 12 characters.",
    ar: "كلمة المرور يجب أن تكون 12 حرفاً على الأقل.",
  },
  "auth.password_missing_upper": {
    en: "Password must contain an uppercase letter.",
    ar: "كلمة المرور يجب أن تحتوي على حرف كبير.",
  },
  "auth.password_missing_lower": {
    en: "Password must contain a lowercase letter.",
    ar: "كلمة المرور يجب أن تحتوي على حرف صغير.",
  },
  "auth.password_missing_digit": {
    en: "Password must contain a number.",
    ar: "كلمة المرور يجب أن تحتوي على رقم.",
  },
  "auth.password_missing_special": {
    en: "Password must contain a special character.",
    ar: "كلمة المرور يجب أن تحتوي على رمز خاص.",
  },
  "auth.passwords_mismatch": {
    en: "Passwords do not match.",
    ar: "كلمات المرور غير متطابقة.",
  },
  "auth.current_password_wrong": {
    en: "Current password is incorrect.",
    ar: "كلمة المرور الحالية غير صحيحة.",
  },

  // Members
  "members.failed_load": {
    en: "Couldn't load team members. Retry or check your connection.",
    ar: "تعذر تحميل أعضاء الفريق. أعد المحاولة أو تحقق من اتصالك.",
  },
  "members.failed_role": {
    en: "Couldn't update role. The member may have been removed.",
    ar: "تعذر تحديث الدور. قد يكون العضو قد أُزيل.",
  },
  "members.failed_edit": {
    en: "Couldn't save changes. Check the email isn't already in use.",
    ar: "تعذر حفظ التغييرات. تأكد أن البريد الإلكتروني غير مستخدم بالفعل.",
  },
  "members.failed_suspend": {
    en: "Couldn't suspend member. They may already be suspended.",
    ar: "تعذر إيقاف العضو. قد يكون موقوفاً بالفعل.",
  },
  "members.failed_resume": {
    en: "Couldn't resume member. They may not be suspended.",
    ar: "تعذر إعادة تفعيل العضو. قد لا يكون موقوفاً.",
  },
  "members.failed_delete": {
    en: "Couldn't remove member. They may be the last admin.",
    ar: "تعذر إزالة العضو. قد يكون آخر مسؤول.",
  },
  "members.failed_invite": {
    en: "Couldn't send invitation. Check the email and try again.",
    ar: "تعذر إرسال الدعوة. تحقق من البريد الإلكتروني وأعد المحاولة.",
  },
  "members.self_demotion": {
    en: "You can't change your own role. Ask another admin.",
    ar: "لا يمكنك تغيير دورك بنفسك. اطلب من مسؤول آخر.",
  },
  "members.self_edit": {
    en: "You can't edit your own account here. Use Settings.",
    ar: "لا يمكنك تعديل حسابك هنا. استخدم الإعدادات.",
  },
  "members.self_suspend": {
    en: "You can't suspend yourself.",
    ar: "لا يمكنك إيقاف نفسك.",
  },
  "members.self_delete": {
    en: "You can't delete yourself.",
    ar: "لا يمكنك حذف نفسك.",
  },
  "members.last_admin": {
    en: "At least one admin must remain. Promote another member first.",
    ar: "يجب أن يبقى مسؤول واحد على الأقل. رَقِّ عضواً آخر أولاً.",
  },
  "members.email_in_use": {
    en: "That email is already used by another member.",
    ar: "هذا البريد الإلكتروني مستخدم من قبل عضو آخر.",
  },
  "members.already_member": {
    en: "This person is already a member of the workspace.",
    ar: "هذا الشخص عضو بالفعل في مساحة العمل.",
  },
  "members.already_suspended": {
    en: "Member is already suspended.",
    ar: "العضو موقوف بالفعل.",
  },
  "members.not_suspended": {
    en: "Member is not suspended.",
    ar: "العضو غير موقوف.",
  },
  "members.not_found": {
    en: "Member not found. They may have been removed.",
    ar: "العضو غير موجود. قد يكون قد أُزيل.",
  },

  // Content
  "content.failed_load": {
    en: "Couldn't load content. Retry or check your connection.",
    ar: "تعذر تحميل المحتوى. أعد المحاولة أو تحقق من اتصالك.",
  },
  "content.failed_detail": {
    en: "Couldn't load this item. It may have been deleted.",
    ar: "تعذر تحميل هذا العنصر. قد يكون قد حُذف.",
  },
  "content.failed_create": {
    en: "Couldn't create item. Check required fields and try again.",
    ar: "تعذر إنشاء العنصر. تحقق من الحقول المطلوبة وأعد المحاولة.",
  },
  "content.failed_update": {
    en: "Couldn't save changes. The item may have been modified by someone else.",
    ar: "تعذر حفظ التغييرات. قد يكون العنصر عُدِّل من قبل شخص آخر.",
  },
  "content.failed_transition": {
    en: "Couldn't change status. Check the workflow rules.",
    ar: "تعذر تغيير الحالة. تحقق من قواعد سير العمل.",
  },
  "content.failed_delete": {
    en: "Couldn't delete item. It may already be gone.",
    ar: "تعذر حذف العنصر. قد يكون حُذف بالفعل.",
  },
  "content.not_found": {
    en: "Content not found.",
    ar: "المحتوى غير موجود.",
  },
  "content.schedule_required": {
    en: "Set a scheduled publish time before scheduling this item.",
    ar: "عيّن وقت نشر مجدول قبل جدولة هذا العنصر.",
  },
  "content.forbidden_transition": {
    en: "Only approvers can move content to this status.",
    ar: "الموافقون فقط يمكنهم نقل المحتوى لهذه الحالة.",
  },
  "content.required_field": {
    en: "{field} is required.",
    ar: "{field} مطلوب.",
  },
  "content.slug_invalid": {
    en: "Slug can only contain lowercase letters, numbers, and hyphens.",
    ar: "المعرف (slug) يمكن أن يحتوي على حروف صغيرة وأرقام وشرطات فقط.",
  },
  "content.slug_taken": {
    en: "This slug is already in use. Choose another.",
    ar: "هذا المعرف مستخدم بالفعل. اختر آخر.",
  },

  // Media
  "media.failed_load": {
    en: "Couldn't load media library. Retry or check your connection.",
    ar: "تعذر تحميل مكتبة الوسائط. أعد المحاولة أو تحقق من اتصالك.",
  },
  "media.failed_upload": {
    en: "Upload failed. Check file type and size, then retry.",
    ar: "فشل الرفع. تحقق من نوع الملف وحجمه ثم أعد المحاولة.",
  },
  "media.failed_delete": {
    en: "Couldn't delete file. It may already be gone.",
    ar: "تعذر حذف الملف. قد يكون حُذف بالفعل.",
  },
  "media.failed_alt": {
    en: "Couldn't save alt text. Retry or refresh.",
    ar: "تعذر حفظ النص البديل. أعد المحاولة أو حدّث الصفحة.",
  },
  "media.storage_disabled": {
    en: "Media storage isn't configured. Uploads are disabled.",
    ar: "تخزين الوسائط غير مُعد. الرفع معطل.",
  },
  "media.file_too_large": {
    en: "File exceeds the 50 MB limit.",
    ar: "حجم الملف يتجاوز الحد المسموح 50 ميجابايت.",
  },
  "media.file_type_invalid": {
    en: "File type not allowed. Use images, PDFs, or Office documents.",
    ar: "نوع الملف غير مسموح. استخدم صوراً أو PDF أو مستندات Office.",
  },
  "media.upload_success": {
    en: "File uploaded.",
    ar: "تم رفع الملف.",
  },
  "media.delete_success": {
    en: "File deleted.",
    ar: "تم حذف الملف.",
  },
  "media.alt_saved": {
    en: "Alt text saved.",
    ar: "تم حفظ النص البديل.",
  },
  "media.url_copied": {
    en: "URL copied to clipboard.",
    ar: "تم نسخ الرابط إلى الحافظة.",
  },

  // Submissions
  "submissions.failed_load": {
    en: "Couldn't load submissions. Retry or check your connection.",
    ar: "تعذر تحميل النماذج المرسلة. أعد المحاولة أو تحقق من اتصالك.",
  },
  "submissions.failed_detail": {
    en: "Couldn't load submission details.",
    ar: "تعذر تحميل تفاصيل النموذج.",
  },
  "submissions.failed_status": {
    en: "Couldn't update status. The submission may have been modified.",
    ar: "تعذر تحديث الحالة. قد يكون النموذج عُدِّل.",
  },
  "submissions.failed_delete": {
    en: "Couldn't delete submission.",
    ar: "تعذر حذف النموذج.",
  },
  "submissions.failed_export": {
    en: "Couldn't export CSV. Try again.",
    ar: "تعذر تصدير CSV. حاول مرة أخرى.",
  },
  "submissions.export_empty": {
    en: "No submissions match the current filters.",
    ar: "لا توجد نماذج مطابقة للتصفية الحالية.",
  },
  "submissions.status_changed": {
    en: "Status updated.",
    ar: "تم تحديث الحالة.",
  },
  "submissions.deleted": {
    en: "Submission deleted.",
    ar: "تم حذف النموذج.",
  },
  "submissions.exported": {
    en: "CSV exported.",
    ar: "تم تصدير CSV.",
  },

  // Settings
  "settings.failed_load": {
    en: "Couldn't load settings. Retry or check your connection.",
    ar: "تعذر تحميل الإعدادات. أعد المحاولة أو تحقق من اتصالك.",
  },
  "settings.failed_save": {
    en: "Couldn't save settings. Retry or check your connection.",
    ar: "تعذر حفظ الإعدادات. أعد المحاولة أو تحقق من اتصالك.",
  },
  "settings.saved": {
    en: "Settings saved.",
    ar: "تم حفظ الإعدادات.",
  },
  "settings.password_changed": {
    en: "Password updated.",
    ar: "تم تحديث كلمة المرور.",
  },

  // Website settings
  "website.failed_load": {
    en: "Couldn't load website settings. Retry or check your connection.",
    ar: "تعذر تحميل إعدادات الموقع. أعد المحاولة أو تحقق من اتصالك.",
  },
  "website.failed_save": {
    en: "Couldn't save website settings. Retry or check your connection.",
    ar: "تعذر حفظ إعدادات الموقع. أعد المحاولة أو تحقق من اتصالك.",
  },
  "website.saved": {
    en: "Website settings saved.",
    ar: "تم حفظ إعدادات الموقع.",
  },
  "website.invalid_url": {
    en: "Enter a valid URL starting with https://.",
    ar: "أدخل رابطاً صحيحاً يبدأ بـ https://.",
  },
  "website.invalid_email": {
    en: "Enter a valid email address.",
    ar: "أدخل عنوان بريد إلكتروني صحيح.",
  },

  // Activity
  "activity.failed_load": {
    en: "Couldn't load activity log. Retry or check your connection.",
    ar: "تعذر تحميل سجل النشاط. أعد المحاولة أو تحقق من اتصالك.",
  },
  "activity.failed_more": {
    en: "Couldn't load more activity. The list you have is still valid.",
    ar: "تعذر تحميل المزيد من النشاط. القائمة الحالية لا تزال صحيحة.",
  },

  // Common / Network
  "common.network_error": {
    en: "Cannot reach the server. Check your connection and retry.",
    ar: "تعذر الوصول للخادم. تحقق من اتصالك وأعد المحاولة.",
  },
  "common.timeout": {
    en: "The server took too long to respond. Retry or try later.",
    ar: "الخادم استغرق وقتاً طويلاً للرد. أعد المحاولة أو جرّب لاحقاً.",
  },
  "common.server_error": {
    en: "Something went wrong on our end. We've been notified. Try again shortly.",
    ar: "حدث خطأ من جهتنا. تم إبلاغنا. حاول مرة أخرى بعد قليل.",
  },
  "common.rate_limited": {
    en: "Too many requests. Wait a moment and retry.",
    ar: "طلبات كثيرة جداً. انتظر لحظة وأعد المحاولة.",
  },
  "common.not_found": {
    en: "Not found.",
    ar: "غير موجود.",
  },
  "common.unsaved_changes": {
    en: "You have unsaved changes. Leave without saving?",
    ar: "لديك تغييرات غير محفوظة. مغادرة دون حفظ؟",
  },
  "common.delete_confirm": {
    en: "This can't be undone. Continue?",
    ar: "لا يمكن التراجع عن هذا. متابعة؟",
  },
};

/**
 * Get a message by key, with optional interpolation.
 */
export function getMessage(
  key: string,
  lang: "en" | "ar" = "en",
  params?: Record<string, string | number>
): string {
  const entry = AR_MESSAGES[key];
  if (!entry) return key; // fallback to key for debugging
  let msg = entry[lang];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return msg;
}

/**
 * Map an ApiError (or unknown error) to a message key and params.
 * Returns the catalog key so callers can also get the AR version.
 */
export function messageForError(
  err: unknown,
  lang: "en" | "ar" = "en"
): { key: string; params?: Record<string, string | number>; message: string } {
  // ApiError from our client
  if (err && typeof err === "object" && "code" in err && "status" in err) {
    const e = err as { code?: string; status: number; message: string; details?: unknown };
    const code = e.code;
    const status = e.status;

    // Domain error codes
    if (code) {
      switch (code) {
        case "INVALID_CREDENTIALS":
          return { key: "auth.invalid_credentials", message: getMessage("auth.invalid_credentials", lang) };
        case "ACCOUNT_LOCKED": {
          const m = e.message.match(/(\d+)\s*minute/);
          return { key: "auth.account_locked", params: { minutes: m ? m[1] : 15 }, message: getMessage("auth.account_locked", lang, { minutes: m ? m[1] : 15 }) };
        }
        case "RATE_LIMITED":
        case "RATE_LIMIT":
          return { key: "auth.rate_limited", message: getMessage("auth.rate_limited", lang) };
        case "UNAUTHENTICATED":
          return { key: "auth.unauthenticated", message: getMessage("auth.unauthenticated", lang) };
        case "FORBIDDEN":
          return { key: "auth.forbidden", message: getMessage("auth.forbidden", lang) };
        case "CSRF_BLOCKED":
          return { key: "auth.csrf_blocked", message: getMessage("auth.csrf_blocked", lang) };
        case "NO_WORKSPACE":
          return { key: "auth.no_workspace", message: getMessage("auth.no_workspace", lang) };
        case "NO_PASSWORD":
          return { key: "auth.no_password", message: getMessage("auth.no_password", lang) };
        case "INVALID_RESET_TOKEN":
          return { key: "auth.invalid_reset_token", message: getMessage("auth.invalid_reset_token", lang) };

        case "SELF_DEMOTION_BLOCKED":
          return { key: "members.self_demotion", message: getMessage("members.self_demotion", lang) };
        case "SELF_EDIT_BLOCKED":
          return { key: "members.self_edit", message: getMessage("members.self_edit", lang) };
        case "SELF_SUSPEND_BLOCKED":
          return { key: "members.self_suspend", message: getMessage("members.self_suspend", lang) };
        case "SELF_DELETE_BLOCKED":
          return { key: "members.self_delete", message: getMessage("members.self_delete", lang) };
        case "LAST_ADMIN":
          return { key: "members.last_admin", message: getMessage("members.last_admin", lang) };
        case "EMAIL_IN_USE":
          return { key: "members.email_in_use", message: getMessage("members.email_in_use", lang) };
        case "ALREADY_MEMBER":
          return { key: "members.already_member", message: getMessage("members.already_member", lang) };
        case "ALREADY_SUSPENDED":
          return { key: "members.already_suspended", message: getMessage("members.already_suspended", lang) };
        case "NOT_SUSPENDED":
          return { key: "members.not_suspended", message: getMessage("members.not_suspended", lang) };
        case "NOT_FOUND":
          // Could be member, content, asset, submission — caller may override
          return { key: "common.not_found", message: getMessage("common.not_found", lang) };
        case "SCHEDULE_REQUIRED":
          return { key: "content.schedule_required", message: getMessage("content.schedule_required", lang) };
        case "FORBIDDEN": // duplicate above
          return { key: "content.forbidden_transition", message: getMessage("content.forbidden_transition", lang) };
        case "STORAGE_NOT_CONFIGURED":
          return { key: "media.storage_disabled", message: getMessage("media.storage_disabled", lang) };
        case "FILE_TOO_LARGE":
          return { key: "media.file_too_large", message: getMessage("media.file_too_large", lang) };
        case "INVALID_FILE_TYPE":
          return { key: "media.file_type_invalid", message: getMessage("media.file_type_invalid", lang) };
        case "NO_FILE":
          return { key: "media.failed_upload", message: getMessage("media.failed_upload", lang) };
        case "VALIDATION_ERROR": {
          // Zod details available in e.details — caller should use fieldErrors()
          return { key: "common.validation_error", message: getMessage("common.validation_error", lang) || "Invalid input. Check the fields and try again." };
        }
      }
    }

    // HTTP status fallback
    if (status === 401) return { key: "auth.unauthenticated", message: getMessage("auth.unauthenticated", lang) };
    if (status === 403) return { key: "auth.forbidden", message: getMessage("auth.forbidden", lang) };
    if (status === 404) return { key: "common.not_found", message: getMessage("common.not_found", lang) };
    if (status === 429) return { key: "common.rate_limited", message: getMessage("common.rate_limited", lang) };
    if (status >= 500) return { key: "common.server_error", message: getMessage("common.server_error", lang) };
    if (status === 0) return { key: "common.network_error", message: getMessage("common.network_error", lang) };
  }

  // Network / timeout from fetch
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return { key: "common.network_error", message: getMessage("common.network_error", lang) };
  }
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return { key: "common.timeout", message: getMessage("common.timeout", lang) };
  }

  // Generic Error
  if (err instanceof Error) {
    return { key: "common.server_error", message: err.message };
  }

  return { key: "common.server_error", message: getMessage("common.server_error", lang) };
}

/**
 * Extract field-level errors from a Zod validation error (VALIDATION_ERROR).
 * Returns a map of field path -> message key (or raw message).
 * Paths like "data.title.en" map to form fields.
 */
export function fieldErrors(
  err: unknown
): Record<string, string> {
  if (!err || typeof err !== "object") return {};
  const e = err as { details?: { fieldErrors?: Record<string, { message: string }[]> } };
  const details = e.details;
  if (!details?.fieldErrors) return {};

  const out: Record<string, string> = {};
  for (const [path, issues] of Object.entries(details.fieldErrors)) {
    // Take the first issue for this field
    out[path] = issues[0]?.message || "Invalid value";
  }
  return out;
}

/**
 * Map backend field paths to frontend field names.
 * Extend as needed for each form.
 */
export function mapFieldPath(path: string): string {
  // data.title.en -> title_en
  // data.description.ar -> description_ar
  // slug -> slug
  // email -> email
  return path
    .replace(/^data\./, "")
    .replace(/\./g, "_");
}