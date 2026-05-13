import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bird, Heart } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { useGetCoupleQuery } from "@/store/api/coupleApi";

export function CoupleDetailPage({ id }: { id: string }) {
  const { data: couple, isLoading, isError, refetch } = useGetCoupleQuery(id);

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/couples"
          className="inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Couples
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement du couple…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger ce couple." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !couple && (
        <>
          <PageHeader title="Couple introuvable" subtitle={`Référence « ${id} » inconnue.`} />
          <Card>
            <Link
              to="/couples"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour aux couples
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && couple && (
        <>
          <PageHeader
            title={couple.id}
            subtitle={`Formé le ${couple.date} · Cage ${couple.cage}`}
            actions={
              <Badge tone={couple.active ? "empty" : "muted"}>
                {couple.active ? "Actif" : "Inactif"}
              </Badge>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold mb-3">Membres</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl border p-3 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Bird className="size-4 text-blue-600" />
                    <span className="text-[11px] font-semibold text-blue-600 uppercase">Mâle</span>
                  </div>
                  <Link
                    to="/pigeons/$ring"
                    params={{ ring: couple.male }}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {couple.male}
                  </Link>
                </div>
                <Heart className="size-5 text-cage-couple shrink-0" fill="currentColor" />
                <div className="flex-1 rounded-xl border p-3 bg-pink-500/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Bird className="size-4 text-pink-600" />
                    <span className="text-[11px] font-semibold text-pink-600 uppercase">Femelle</span>
                  </div>
                  <Link
                    to="/pigeons/$ring"
                    params={{ ring: couple.femelle }}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {couple.femelle}
                  </Link>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Cage</div>
                  <Link
                    to="/cages/$code"
                    params={{ code: couple.cage }}
                    className="font-mono text-primary hover:underline"
                  >
                    {couple.cage}
                  </Link>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Formé le</div>
                  <div className="font-medium">{couple.date}</div>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold mb-3">Reproductions enregistrées</h3>
              <p className="text-3xl font-semibold">{couple.reproductions}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Détail des pontes disponible après connexion à l'API.
              </p>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
