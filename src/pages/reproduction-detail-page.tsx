import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird, Egg } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetReproductionQuery } from "@/store/api/reproductionApi";

const STATUT_LABELS = {
  en_cours: "En cours",
  terminee: "Terminée",
  echec: "Échec",
} as const;

const STATUT_TONES = {
  en_cours: "empty" as const,
  terminee: "couple" as const,
  echec: "single" as const,
};

export function ReproductionDetailPage({ id }: { id: string }) {
  const reproId = Number(id);
  const { data: r, isLoading, isError, refetch } = useGetReproductionQuery(reproId, {
    skip: isNaN(reproId),
  });

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/reproductions"
          className="inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Reproductions
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement de la reproduction…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger cette reproduction." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !r && (
        <>
          <PageHeader title="Reproduction introuvable" />
          <Card>
            <Link
              to="/reproductions"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour à la liste
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && r && (() => {
        const maleBague = r.couple?.male?.code_bague;
        const femelleBague = r.couple?.femelle?.code_bague;
        const maleId = r.couple?.male?.id;
        const femelleId = r.couple?.femelle?.id;
        const jeunes = r.nombre_jeunes ?? 0;
        const pigeons = r.pigeons ?? [];
        return (
          <>
            <PageHeader
              title={`Reproduction #${r.id}`}
              subtitle={`Couple #${r.couple_id}`}
              actions={
                <Badge tone={STATUT_TONES[r.statut]}>
                  {STATUT_LABELS[r.statut]}
                </Badge>
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="text-sm font-semibold mb-3">Parents</h3>
                <div className="space-y-2">
                  {maleId ? (
                    <Link
                      to="/pigeons/$ring"
                      params={{ ring: String(maleId) }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                    >
                      <Bird className="size-4" />
                      <span className="font-mono text-sm">{maleBague}</span>
                      <span className="ml-auto text-[10px] font-semibold uppercase">Mâle</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 text-blue-600">
                      <Bird className="size-4" />
                      <span className="font-mono text-sm text-muted-foreground">—</span>
                      <span className="ml-auto text-[10px] font-semibold uppercase">Mâle</span>
                    </div>
                  )}
                  {femelleId ? (
                    <Link
                      to="/pigeons/$ring"
                      params={{ ring: String(femelleId) }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-colors"
                    >
                      <Bird className="size-4" />
                      <span className="font-mono text-sm">{femelleBague}</span>
                      <span className="ml-auto text-[10px] font-semibold uppercase">Femelle</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-pink-500/10 text-pink-600">
                      <Bird className="size-4" />
                      <span className="font-mono text-sm text-muted-foreground">—</span>
                      <span className="ml-auto text-[10px] font-semibold uppercase">Femelle</span>
                    </div>
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm border-t pt-4">
                  <div>
                    <dt className="text-muted-foreground text-xs">Couple</dt>
                    <dd>
                      <Link
                        to="/couples/$id"
                        params={{ id: String(r.couple_id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        #{r.couple_id}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Ponte</dt>
                    <dd className="font-medium">{r.date_ponte}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Éclosion</dt>
                    <dd className="font-medium">{r.date_eclosion ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Jeunes</dt>
                    <dd className="font-medium">{jeunes}</dd>
                  </div>
                </dl>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Egg className="size-4" /> Jeunes nés
                </h3>
                {pigeons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun jeune enregistré.</p>
                ) : (
                  <ul className="space-y-2">
                    {pigeons.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/pigeons/$ring"
                          params={{ ring: String(p.id) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cage-empty-soft border border-cage-empty-border hover:bg-cage-empty-soft/80 transition-colors"
                        >
                          <Bird className="size-4 text-cage-empty" />
                          <span className="font-mono text-sm">{p.code_bague}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        );
      })()}
    </AppShell>
  );
}
