import { useEffect, useRef, type ReactNode } from "react"

import { Heading } from "./Heading"
import { Button } from "./Button"

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="modal-head">
        <Heading level={2}>{title}</Heading>
        <Button
          variant="ghost"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </Button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </dialog>
  )
}