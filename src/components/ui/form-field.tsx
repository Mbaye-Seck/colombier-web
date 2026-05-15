import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const inputCls =
  "mt-1.5 flex h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
}

export function InputField({
  id,
  label,
  error,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className={cn(inputCls, error && "border-destructive")} {...props} />
      {error && (
        <p role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  className,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={cn(inputCls, "cursor-pointer", error && "border-destructive")}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  id,
  label,
  error,
  className,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={3}
        className={cn(
          "mt-1.5 flex w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 resize-none disabled:opacity-50",
          error && "border-destructive",
        )}
        {...props}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
