import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetPigeonQuery } from "@/store/api/pigeonApi";
import { cn } from "@/lib/utils";
import type { PigeonStatut } from "@/types/pigeon";

const STATUT_LABELS: Record<PigeonStatut, string> = {
  actif: "Actif",
  vendu: "Vendu",
  mort: "Mort",
  perdu: "Perdu",
};

export function PigeonDetailPage({ ring }: { ring: string }) {
  const pigeonId = Number(ring);
  const { data: pigeon, isLoading, isError, refetch } = useGetPigeonQuery(pigeonId, {
    skip: isNaN(pigeonId),
  });

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/pigeons"
          className={cn(
            "inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted",
          )}
        >
          <ArrowLeft className="size-4" /> Pigeons
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement du pigeon…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger ce pigeon." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !pigeon && (
        <>
          <PageHeader
            title="Pigeon introuvable"
            subtitle={`Aucun pigeon avec l'identifiant « ${ring} ».`}
          />
          <Card>
            <Link
              to="/pigeons"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour à la liste
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && pigeon && (
        <>
          <PageHeader
            title={pigeon.code_bague}
            subtitle={[pigeon.race, pigeon.couleur].filter(Boolean).join(" · ") || "—"}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold mb-3">Identité</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sexe</dt>
                  <dd>
                    <Badge tone={pigeon.sexe === "male" ? "default" : "couple"}>
                      {pigeon.sexe === "male" ? "Mâle" : "Femelle"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Race</dt>
                  <dd>{pigeon.race ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Couleur</dt>
                  <dd>{pigeon.couleur ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date de naissance</dt>
                  <dd>{pigeon.date_naissance ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Statut</dt>
                  <dd>
                    <Badge
                      tone={
                        pigeon.statut === "actif"
                          ? "empty"
                          : pigeon.statut === "vendu"
                            ? "muted"
                            : "single"
                      }
                    >
                      {STATUT_LABELS[pigeon.statut]}
                    </Badge>
                  </dd>
                </div>
                {pigeon.pere && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Père</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(pigeon.pere.id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        {pigeon.pere.code_bague}
                      </Link>
                    </dd>
                  </div>
                )}
                {pigeon.mere && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Mère</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(pigeon.mere.id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        {pigeon.mere.code_bague}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
            <Card className="flex flex-col items-center justify-center min-h-50 text-muted-foreground">
              <Bird className="size-12 opacity-30 mb-2" />
              <p className="text-sm text-center">Historique et documents disponibles prochainement.</p>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
