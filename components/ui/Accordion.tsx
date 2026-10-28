// components/ui/Accordion.tsx
// Also requires: @/lib/utils
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  expandedValues: Set<string>;
  toggleValue: (value: string) => void;
  type: "single" | "multiple";
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export type AccordionProps = {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children?: React.ReactNode;
  className?: string;
};

export function Accordion({
  type = "single",
  collapsible = true,
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValues, setInternalValues] = React.useState<Set<string>>(() => {
    if (defaultValue) {
      return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
    }
    return new Set<string>();
  });

  const expandedValues = React.useMemo(() => {
    if (isControlled) {
      if (!controlledValue) return new Set<string>();
      return new Set(Array.isArray(controlledValue) ? controlledValue : [controlledValue]);
    }
    return internalValues;
  }, [isControlled, controlledValue, internalValues]);

  const toggleValue = React.useCallback(
    (itemValue: string) => {
      const next = new Set(expandedValues);
      if (next.has(itemValue)) {
        if (type === "single" && !collapsible && next.size === 1) {
          return;
        }
        next.delete(itemValue);
      } else {
        if (type === "single") {
          next.clear();
        }
        next.add(itemValue);
      }

      if (!isControlled) {
        setInternalValues(next);
      }

      if (onValueChange) {
        const arr = Array.from(next);
        onValueChange(type === "single" ? arr[0] ?? "" : arr);
      }
    },
    [collapsible, expandedValues, isControlled, onValueChange, type]
  );

  return (
    <AccordionContext.Provider value={{ expandedValues, toggleValue, type }}>
      <div className={cn("w-full divide-y divide-foreground/10 border-y border-foreground/10", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const AccordionItemContext = React.createContext<{ value: string; id: string } | null>(null);

export type AccordionItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const autoId = React.useId();
  return (
    <AccordionItemContext.Provider value={{ value, id: autoId }}>
      <div className={cn("overflow-hidden transition-colors", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export type AccordionTriggerProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function AccordionTrigger({ children, icon, className }: AccordionTriggerProps) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  if (!ctx || !itemCtx) {
    throw new Error("AccordionTrigger must be used inside Accordion and AccordionItem");
  }

  const isOpen = ctx.expandedValues.has(itemCtx.value);
  const contentId = `${itemCtx.id}-content`;
  const triggerId = `${itemCtx.id}-trigger`;

  return (
    <h3 className="flex">
      <button
        type="button"
        id={triggerId}
        aria-controls={contentId}
        aria-expanded={isOpen}
        onClick={() => ctx.toggleValue(itemCtx.value)}
        className={cn(
          "group flex w-full items-center justify-between gap-4 py-4 text-left transition-all select-none hover:text-foreground active:scale-[0.998]",
          className
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {icon ? (
            <span
              className="flex size-5 shrink-0 items-center justify-center text-[#E83A00] transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : null}
          <span className="font-medium text-base text-foreground leading-snug tracking-tight truncate">
            {children}
          </span>
        </div>

        <span
          className="flex size-6 shrink-0 items-center justify-center text-[#E83A00] transition-transform duration-200 ease-out"
          aria-hidden="true"
        >
          <Plus
            size={18}
            strokeWidth={2}
            className={cn("transition-transform duration-200 ease-out", isOpen && "rotate-45")}
          />
        </span>
      </button>
    </h3>
  );
}

export type AccordionContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function AccordionContent({ children, className }: AccordionContentProps) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  if (!ctx || !itemCtx) {
    throw new Error("AccordionContent must be used inside Accordion and AccordionItem");
  }

  const isOpen = ctx.expandedValues.has(itemCtx.value);
  const contentId = `${itemCtx.id}-content`;
  const triggerId = `${itemCtx.id}-trigger`;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        "grid transition-[grid-template-rows] duration-250 ease-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn("pb-4 pt-1 text-sm text-foreground/75 leading-relaxed pl-8.5 pr-2", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
