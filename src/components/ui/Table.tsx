import { type HTMLAttributes, type ReactNode } from "react"

export function Table({ children, className = "", ...props }: HTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
  return <table className={`w-full border-collapse ${className}`} {...props}>{children}</table>
}

export function TableHeader({ children, className = "", ...props }: HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode }) {
  return <thead className={`${className}`} {...props}>{children}</thead>
}

export function TableBody({ children, className = "", ...props }: HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode }) {
  return <tbody className={`${className}`} {...props}>{children}</tbody>
}

export function TableRow({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode }) {
  return <tr className={`${className}`} {...props}>{children}</tr>
}

export function TableHead({ children, className = "", ...props }: HTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-strong border-b border-line ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = "", ...props }: HTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td className={`px-4 py-3 text-sm text-navy-2 border-b border-line/50 ${className}`} {...props}>
      {children}
    </td>
  )
}