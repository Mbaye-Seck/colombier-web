import { Link } from "@tanstack/react-router";
import { ArrowLeft, Banknote, Skull, HelpCircle } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetExitQuery } from "@/store/api/exitApi";

const TYPE_CONFIG = {
  Vente: { tone: "empty" as const, icon: Banknote, label: "Vente" },
  Décès: { tone: "single" as const, icon: Skull, label: "Décès" },
  Perte: { tone: "couple" as const, icon: HelpCircle, label: "Perte" },
};

export function ExitDetailPage({ id }: { id: string }) {
  const { data: e, isLoading, isError, refetch } = useGetExitQuery(id);

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
        const cfg = TYPE_CONFIG[e.type];
        const Icon = cfg.icon;
        return (
          <>
            <PageHeader
              title={e.id}
              subtitle={e.date}
              actions={<Badge tone={cfg.tone}>{e.type}</Badge>}
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
                    <div className="font-semibold">{e.type}</div>
                  </div>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Pigeon</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: e.ring }}
                        className="font-mono text-primary hover:underline"
                      >
                        {e.ring}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">{e.date}</dd>
                  </div>
                  {e.type === "Vente" && (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Acheteur</dt>
                        <dd className="font-medium">{e.acheteur}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Prix</dt>
                        <dd className="font-medium">{e.prix}</dd>
                      </div>
                    </>
                  )}
                  {(e.type === "Décès" || e.type === "Perte") && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        {e.type === "Décès" ? "Cause" : "Circonstance"}
                      </dt>
                      <dd className="font-medium text-right">{e.cause}</dd>
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
