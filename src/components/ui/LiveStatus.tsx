export function LiveStatus({ message }: { message: string | null }) {
  return <span aria-live="polite" role="status" className="sr-only">{message ?? ''}</span>
}