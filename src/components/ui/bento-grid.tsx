import type { ElementType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BentoIcon = ElementType;

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 lg:auto-rows-[22rem] lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};


const BentoBackground = ({
  accent = "#C95B3C",
  secondary = "#14B8A6",
  label,
}: {
  accent?: string;
  secondary?: string;
  label?: string;
}) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-25 blur-3xl transition-transform duration-500 group-hover:scale-110"
      style={{ background: accent }}
    />
    <div
      className="absolute -bottom-24 left-6 h-44 w-44 rounded-full opacity-20 blur-3xl transition-transform duration-500 group-hover:scale-110"
      style={{ background: secondary }}
    />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 to-transparent" />
    {label ? (
      <div className="absolute right-5 top-5 rounded-lg border border-border/60 bg-background/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-md">
        {label}
      </div>
    ) : null}
  </div>
);
const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
}: {
  name: string;
  className?: string;
  background: ReactNode;
  Icon: BentoIcon;
  description: string;
  href?: string;
  cta?: string;
}) => (
  <div
    className={cn(
      "group relative col-span-1 flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-lg",
      "border border-border/70 bg-card/70 shadow-[0_14px_36px_rgba(15,23,42,.07)] backdrop-blur-xl",
      "transform-gpu transition-[border-color,box-shadow,transform,background] duration-300 ease-out",
      "hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_22px_58px_rgba(15,23,42,.12)]",
      "focus-within:-translate-y-1 focus-within:border-primary/45 focus-within:shadow-[0_22px_58px_rgba(15,23,42,.12)]",
      "dark:bg-card/55 dark:shadow-[0_-20px_80px_-20px_rgba(255,255,255,.12)_inset]",
      className,
    )}
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {background}
    </div>

    <div className="pointer-events-none relative z-10 flex transform-gpu flex-col gap-2 p-6 transition-transform duration-300">
      <Icon className="h-11 w-11 origin-left transform-gpu text-primary transition-transform duration-300 ease-out group-hover:scale-95 group-focus-within:scale-95" aria-hidden="true" />
      <h3 className="max-w-lg text-xl font-black leading-tight tracking-tight text-foreground">
        {name}
      </h3>
      <p className="max-w-lg text-sm font-medium leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-colors duration-300 group-hover:bg-foreground/[.025] group-focus-within:bg-foreground/[.025]" aria-hidden="true" />
  </div>
);

export { BentoBackground, BentoCard, BentoGrid };
