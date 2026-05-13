import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird, History } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetCageQuery } from "@/store/api/cageApi";
import { CAGE_STATUS_LABELS } from "@/types/cage";
import { cn } from "@/lib/utils";

export function CageDetailPage({ code }: { code: string }) {
  const cageId = Number(decodeURIComponent(code));
  const { data: cage, isLoading, isError, refetch } = useGetCageQuery(cageId, {
    skip: isNaN(cageId),
  });

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/cages"
          className={cn(
            "inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted",
          )}
        >
          <ArrowLeft className="size-4" /> Volières &amp; cages
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement de la cage…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger cette cage." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !cage && (
        <>
          <PageHeader title="Cage introuvable" subtitle={`Identifiant « ${code} » inconnu.`} />
          <Card>
            <Link
              to="/cages"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour aux volières
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && cage && (
        <>
          <PageHeader title={`Cage ${cage.code}`} subtitle={CAGE_STATUS_LABELS[cage.status]} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4">
                <Badge tone={cage.status}>
                  {cage.status === "empty" ? "Libre" : cage.status === "single" ? "1 pigeon" : "Couple"}
                </Badge>
              </div>
              {cage.occupants.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cette cage est actuellement libre.</p>
              ) : (
                <ul className="space-y-3">
                  {cage.occupants.map((o) => (
                    <li key={o.ring}>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(o.pigeonId) }}
                        className="flex gap-3 p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "size-12 rounded-lg grid place-items-center shrink-0",
                            o.sex === "M"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-pink-500/10 text-pink-600",
                          )}
                        >
                          <Bird className="size-6" />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{o.sex === "M" ? "Mâle" : "Femelle"}</div>
                          <div className="text-muted-foreground font-mono text-xs">{o.ring}</div>
                          <div className="text-xs text-muted-foreground">{o.race}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="size-4" /> Historique récent
              </h3>
              {cage.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun historique disponible.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {cage.history.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{h.date}</span>
                      <span>{h.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
