import { type ReactNode } from "react";

export function Heading({
  level = 2,
  className = "",
  children,
}: {
  level?: 1 | 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}) {
  const classes = {
    1: "text-h1",
    2: "text-h2",
    3: "text-h3",
    4: "text-h4",
  }[level];

  if (level === 1) return <h1 className={`${classes} ${className}`}>{children}</h1>;
  if (level === 2) return <h2 className={`${classes} ${className}`}>{children}</h2>;
  if (level === 3) return <h3 className={`${classes} ${className}`}>{children}</h3>;
  return <h4 className={`${classes} ${className}`}>{children}</h4>;
}