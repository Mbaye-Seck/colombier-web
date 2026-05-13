/**
 * Composants utilitaires pour les états de chargement, erreur et vide.
 * Réutilisables sur toutes les pages de liste et de détail.
 */
import { Loader2, AlertTriangle, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = "Chargement…", className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-8 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  message = "Une erreur est survenue.",
  onRetry,
  className,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-destructive",
        className,
      )}
    >
      <AlertTriangle className="size-8" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs underline underline-offset-2 hover:no-underline"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Aucun résultat",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground",
        className,
      )}
    >
      <SearchX className="size-10 opacity-40" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
