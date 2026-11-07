import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}) {
  const Child = props.asChild ? "span" : "button";
  const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded-lg";
  const variants = {
    primary: "bg-navy text-ivory hover:bg-navy-2",
    secondary: "bg-gold-strong text-ivory hover:bg-gold",
    ghost: "bg-transparent text-navy hover:bg-ivory-2",
    outline: "border border-line bg-transparent text-navy hover:bg-ivory-2",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <Child
      className={`${base} ${variants[variant]} ${sizes[props.size ?? "md"]} ${className}`}
      {...(Child === "button" ? { type: "button" } : {})}
      {...props}
    />
  );
}