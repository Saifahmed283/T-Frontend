import { useEffect, useRef, type ReactNode } from 'react'

export function Dialog({ open, onClose, labelledBy, onBackdropClick, children, className = '' }: { open: boolean; onClose: () => void; labelledBy?: string; onBackdropClick?: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const root = ref.current
    if (!root) return
    const restored: HTMLElement[] = []
    let node: HTMLElement | null = root
    while (node && node.parentElement) {
      const parent: HTMLElement | null = node.parentElement
      for (const child of Array.from(parent.children)) {
        if (child === node || !(child instanceof HTMLElement) || child.inert) continue
        child.inert = true
        restored.push(child)
      }
      if (parent === document.body) break
      node = parent
    }
    return () => { for (const el of restored) el.inert = false }
  }, [open])
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const root = ref.current
    if (!root) return
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    const f = () => focusables()
    requestAnimationFrame(() => f()[0]?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab') return
      const fs = f()
      if (!fs.length) return
      const first = fs[0]!
      const last = fs[fs.length - 1]!
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={onBackdropClick} className={`fixed inset-0 z-[60] ${className}`}>
      {children}
    </div>
  )
}