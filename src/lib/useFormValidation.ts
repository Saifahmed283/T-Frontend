/**
 * A small, dependency-free form-validation hook used across TerraMorph.
 *
 * Values are held in one state object. Errors are derived on render, so a
 * field's message always matches its current value. A message is only shown
 * once the field has been blurred or the form has been submitted — users
 * are never shouted at while they type for the first time.
 *
 *   const form = useFormValidation({
 *     fields: {
 *       email: { initial: "", validate: (v) => validateEmail(v, lang) },
 *     },
 *     onSubmit: async (values) => { ... },
 *   })
 *
 *   <form {...form.formProps} noValidate>
 *     <input {...form.input("email")} aria-describedby={form.errorId("email")} />
 *     {form.error("email") && <p id={form.errorId("email")}>{form.error("email")}</p>}
 *   </form>
 */

import { useCallback, useMemo, useRef, useState } from "react"

export type Validator = (value: unknown, values: Record<string, unknown>) => string | null

export interface FieldConfig {
  initial: unknown
  validate?: Validator
}

export interface UseFormValidationOptions {
  fields: Record<string, FieldConfig>
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void
  /** Validate a field as soon as it has been blurred once. Default: true. */
  validateOnBlur?: boolean
}

export interface FieldProps {
  id: string
  name: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur: () => void
  "aria-invalid": boolean | undefined
  "aria-describedby": string | undefined
}

export interface CheckboxProps {
  id: string
  name: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  "aria-invalid": boolean | undefined
  "aria-describedby": string | undefined
}

export interface FormProps {
  ref: React.RefObject<HTMLFormElement | null>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  noValidate: boolean
}

const EMPTY_TOUCHED: Record<string, boolean> = {}

export function useFormValidation({
  fields,
  onSubmit,
  validateOnBlur = true,
}: UseFormValidationOptions) {
  const configRef = useRef(fields)
  configRef.current = fields

  const initialValues = useMemo(() => {
    const next: Record<string, unknown> = {}
    for (const [name, config] of Object.entries(fields)) {
      next[name] = config.initial
    }
    return next
    // Field definitions are stable per form; re-running on every render would
    // reset state. Rely on the initial config captured at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attempted, setAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const allErrors = useMemo(() => {
    const next: Record<string, string> = {}
    for (const [name, config] of Object.entries(configRef.current)) {
      if (!config.validate) continue
      const error = config.validate(values[name], values)
      if (error) next[name] = error
    }
    return next
  }, [values])

  const isVisible = useCallback(
    (name: string): boolean => Boolean(attempted || touched[name]),
    [attempted, touched],
  )

  const error = useCallback(
    (name: string): string | null =>
      isVisible(name) ? (allErrors[name] ?? null) : null,
    [allErrors, isVisible],
  )

  const rawError = useCallback(
    (name: string): string | null => allErrors[name] ?? null,
    [allErrors],
  )

  const errorId = useCallback((name: string) => `field-error-${name}`, [])

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const markTouched = useCallback((name: string) => {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }))
  }, [])

  const clearSubmitError = useCallback(() => setSubmitError(null), [])

  const validateAll = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    for (const [name, config] of Object.entries(configRef.current)) {
      if (!config.validate) continue
      const message = config.validate(values[name], values)
      if (message) errors[name] = message
    }
    return Object.keys(errors).length === 0
  }, [values])

  const focusFirstInvalid = useCallback(() => {
    // Wait for the render that marks fields aria-invalid.
    requestAnimationFrame(() => {
      const form = formRef.current
      if (!form) return
      const first = form.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
    })
  }, [])

  const submit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) event.preventDefault()
      setAttempted(true)
      setSubmitError(null)

      const valid = validateAll()
      if (!valid) {
        focusFirstInvalid()
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (cause) {
        const message =
          cause instanceof Error && cause.message
            ? cause.message
            : "Something went wrong. Please try again."
        setSubmitError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [focusFirstInvalid, onSubmit, validateAll, values],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setTouched(EMPTY_TOUCHED)
    setAttempted(false)
    setSubmitError(null)
    setIsSubmitting(false)
  }, [initialValues])

  const onChange = useCallback(
    (name: string) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target
        const next =
          target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value
        setValue(name, next)
      },
    [setValue],
  )

  const input = useCallback(
    (name: string): FieldProps => ({
      id: name,
      name,
      value: typeof values[name] === "string" ? (values[name] as string) : "",
      onChange: onChange(name),
      onBlur: validateOnBlur ? () => markTouched(name) : () => markTouched(name),
      "aria-invalid": error(name) ? true : undefined,
      "aria-describedby": error(name) ? errorId(name) : undefined,
    }),
    [error, errorId, markTouched, onChange, validateOnBlur, values],
  )

  const checkbox = useCallback(
    (name: string): CheckboxProps => ({
      id: name,
      name,
      checked: values[name] === true,
      onChange: onChange(name),
      onBlur: () => markTouched(name),
      "aria-invalid": error(name) ? true : undefined,
      "aria-describedby": error(name) ? errorId(name) : undefined,
    }),
    [error, errorId, markTouched, onChange, values],
  )

  const formProps: FormProps = {
    ref: formRef,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
      void submit(event)
    },
    noValidate: true,
  }

  const hasErrors = Object.keys(allErrors).length > 0

  return {
    values,
    errors: allErrors,
    error,
    rawError,
    errorId,
    hasErrors,
    isValid: !hasErrors,
    showError: isVisible,
    isSubmitting,
    submitError,
    clearSubmitError,
    setValue,
    markTouched,
    input,
    checkbox,
    formProps,
    submit,
    reset,
  }
}

export type FormValidation = ReturnType<typeof useFormValidation>
