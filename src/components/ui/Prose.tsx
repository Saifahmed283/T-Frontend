import { type ReactNode } from "react";

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`prose prose-navy max-w-none ${className}`}>{children}</div>;
}