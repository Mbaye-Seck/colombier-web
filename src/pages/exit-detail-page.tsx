import { Link } from "@tanstack/react-router";
import { ArrowLeft, Banknote, Skull, HelpCircle } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetExitQuery } from "@/store/api/exitApi";
import type { SortieType } from "@/types/exit";

const TYPE_CONFIG: Record<SortieType, { tone: "empty" | "single" | "couple"; icon: typeof Banknote; label: string }> = {
  vente: { tone: "empty", icon: Banknote, label: "Vente" },
  deces: { tone: "single", icon: Skull, label: "Décès" },
  perte: { tone: "couple", icon: HelpCircle, label: "Perte" },
};

export function ExitDetailPage({ id }: { id: string }) {
  const exitId = Number(id);
  const { data: e, isLoading, isError, refetch } = useGetExitQuery(exitId, {
    skip: isNaN(exitId),
  });

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/exits"
          className="inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Sorties
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement de la sortie…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger cette sortie." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !e && (
        <>
          <PageHeader title="Sortie introuvable" />
          <Card>
            <Link
              to="/exits"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour aux sorties
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && e && (() => {
        const cfg = TYPE_CONFIG[e.type_sortie];
        const Icon = cfg.icon;
        const pigeonLabel = e.pigeon?.code_bague ?? `#${e.pigeon_id}`;
        return (
          <>
            <PageHeader
              title={`Sortie #${e.id}`}
              subtitle={e.date_sortie}
              actions={<Badge tone={cfg.tone}>{cfg.label}</Badge>}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`size-12 rounded-xl grid place-items-center ${
                    cfg.tone === "empty"
                      ? "bg-cage-empty-soft text-cage-empty"
                      : cfg.tone === "single"
                        ? "bg-cage-single-soft text-cage-single"
                        : "bg-cage-couple-soft text-cage-couple"
                  }`}>
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="font-semibold">{cfg.label}</div>
                  </div>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Pigeon</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(e.pigeon_id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        {pigeonLabel}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">{e.date_sortie}</dd>
                  </div>
                  {e.type_sortie === "vente" && (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Acheteur</dt>
                        <dd className="font-medium">{e.acheteur ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Prix</dt>
                        <dd className="font-medium">{e.prix != null ? `${e.prix} €` : "—"}</dd>
                      </div>
                    </>
                  )}
                  {e.type_sortie === "deces" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Cause</dt>
                      <dd className="font-medium text-right">{e.cause ?? "—"}</dd>
                    </div>
                  )}
                  {e.type_sortie === "perte" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Circonstance</dt>
                      <dd className="font-medium text-right">{e.circonstance ?? "—"}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            </div>
          </>
        );
      })()}
    </AppShell>
  );
}
