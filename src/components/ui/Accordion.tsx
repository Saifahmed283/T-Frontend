import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui";

interface AccordionProps {
  children: ReactNode;
  className?: string;
  type?: "single" | "multiple";
}

export function Accordion({ children, className = "", type = "single" }: AccordionProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className = "" }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-line rounded-xl overflow-hidden ${className}`}>
      <AccordionTrigger value={value} open={open} onOpenChange={setOpen}>
        {children}
      </AccordionTrigger>
      {open && <AccordionContent>{children}</AccordionContent>}
    </div>
  );
}

interface AccordionTriggerProps {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

export function AccordionTrigger({ value, open, onOpenChange, children, className = "" }: AccordionTriggerProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-between px-4 py-3 text-left ${className}`}
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
      aria-controls={`accordion-content-${value}`}
    >
      <span>{children}</span>
      {open ? <ChevronUp className="h-5 w-5 text-gold-strong" /> : <ChevronDown className="h-5 w-5 text-slate-strong" />}
    </Button>
  );
}

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className = "" }: AccordionContentProps) {
  return <div id={`accordion-content-${Math.random()}`} className={`px-4 pb-4 ${className}`}>{children}</div>;
}