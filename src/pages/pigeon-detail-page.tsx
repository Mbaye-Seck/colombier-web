import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetPigeonQuery } from "@/store/api/pigeonApi";
import { cn } from "@/lib/utils";

export function PigeonDetailPage({ ring }: { ring: string }) {
  const { data: pigeon, isLoading, isError, refetch } = useGetPigeonQuery(ring);

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
            subtitle={`Aucun pigeon avec le matricule « ${ring} ».`}
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
          <PageHeader title={pigeon.ring} subtitle={`${pigeon.race} · ${pigeon.cage}`} />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold mb-3">Identité</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sexe</dt>
                  <dd>
                    <Badge tone={pigeon.sex === "M" ? "default" : "couple"}>
                      {pigeon.sex === "M" ? "Mâle" : "Femelle"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Race</dt>
                  <dd>{pigeon.race}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Couleur</dt>
                  <dd>{pigeon.couleur}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Âge</dt>
                  <dd>{pigeon.age}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Statut</dt>
                  <dd>
                    <Badge
                      tone={
                        pigeon.statut === "Actif"
                          ? "empty"
                          : pigeon.statut === "Reproduction"
                            ? "couple"
                            : "muted"
                      }
                    >
                      {pigeon.statut}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cage</dt>
                  <dd>
                    <Link
                      to="/cages/$code"
                      params={{ code: pigeon.cage }}
                      className="font-mono text-primary hover:underline"
                    >
                      {pigeon.cage}
                    </Link>
                  </dd>
                </div>
              </dl>
            </Card>
            <Card className="flex flex-col items-center justify-center min-h-50 text-muted-foreground">
              <Bird className="size-12 opacity-30 mb-2" />
              <p className="text-sm text-center">Historique et documents disponibles après connexion à l'API.</p>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
