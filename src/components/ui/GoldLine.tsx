import { type ReactNode } from "react";

export function GoldLine({ className = "" }: { className?: string }) {
  return <hr className={`border-gold border-t w-full my-6 ${className}`} aria-hidden="true" />;
}