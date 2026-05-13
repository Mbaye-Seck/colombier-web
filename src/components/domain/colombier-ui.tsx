import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  tone?: "default" | "empty" | "single" | "couple";
}) {
  const toneCls = {
    default: "bg-primary/10 text-primary",
    empty: "bg-cage-empty-soft text-cage-empty",
    single: "bg-cage-single-soft text-cage-single",
    couple: "bg-cage-couple-soft text-cage-couple",
  }[tone];

  return (
    <div className="rounded-2xl border bg-card p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
        </div>
        {icon && (
          <div className={cn("size-10 rounded-xl grid place-items-center", toneCls)}>{icon}</div>
        )}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "empty" | "single" | "couple" | "muted";
}) {
  const cls = {
    default: "bg-primary/10 text-primary border-primary/20",
    empty: "bg-cage-empty-soft text-cage-empty border-cage-empty-border",
    single: "bg-cage-single-soft text-cage-single border-cage-single-border",
    couple: "bg-cage-couple-soft text-cage-couple border-cage-couple-border",
    muted: "bg-muted text-muted-foreground border-border",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        cls,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md";
}) {
  const variantCls = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-muted text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border hover:bg-muted text-foreground",
  }[variant];
  const sizeCls = size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50",
        variantCls,
        sizeCls,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5", className)}>{children}</div>;
}
