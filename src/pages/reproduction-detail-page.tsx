import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird, Egg } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetReproductionQuery } from "@/store/api/reproductionApi";

export function ReproductionDetailPage({ id }: { id: string }) {
  const { data: r, isLoading, isError, refetch } = useGetReproductionQuery(id);

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

      {!isLoading && !isError && r && (
        <>
          <PageHeader
            title={r.id}
            subtitle={`Couple ${r.couple}`}
            actions={
              <Badge tone="couple">
                {r.jeunes} jeune{r.jeunes > 1 ? "s" : ""}
              </Badge>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold mb-3">Parents</h3>
              <div className="space-y-2">
                <Link
                  to="/pigeons/$ring"
                  params={{ ring: r.pere }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                >
                  <Bird className="size-4" />
                  <span className="font-mono text-sm">{r.pere}</span>
                  <span className="ml-auto text-[10px] font-semibold uppercase">Mâle</span>
                </Link>
                <Link
                  to="/pigeons/$ring"
                  params={{ ring: r.mere }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-colors"
                >
                  <Bird className="size-4" />
                  <span className="font-mono text-sm">{r.mere}</span>
                  <span className="ml-auto text-[10px] font-semibold uppercase">Femelle</span>
                </Link>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm border-t pt-4">
                <div>
                  <dt className="text-muted-foreground text-xs">Couple</dt>
                  <dd>
                    <Link
                      to="/couples/$id"
                      params={{ id: r.couple }}
                      className="font-mono text-primary hover:underline"
                    >
                      {r.couple}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Ponte</dt>
                  <dd className="font-medium">{r.ponte}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Éclosion</dt>
                  <dd className="font-medium">{r.eclosion}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Jeunes</dt>
                  <dd className="font-medium">{r.jeunes}</dd>
                </div>
              </dl>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Egg className="size-4" /> Jeunes nés
              </h3>
              <ul className="space-y-2">
                {r.jeunesIds.map((jid) => (
                  <li key={jid}>
                    <Link
                      to="/pigeons/$ring"
                      params={{ ring: jid }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cage-empty-soft border border-cage-empty-border hover:bg-cage-empty-soft/80 transition-colors"
                    >
                      <Bird className="size-4 text-cage-empty" />
                      <span className="font-mono text-sm">{jid}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
