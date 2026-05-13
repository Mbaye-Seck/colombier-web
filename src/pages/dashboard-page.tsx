import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, StatCard, Card, Badge, Button } from "@/components/domain";
import { useAuth } from "@/providers/auth-provider";
import {
  DASHBOARD_ACTIVITY,
  DASHBOARD_CHART_BARS,
  DASHBOARD_RECENT_REPRODUCTIONS,
} from "@/services/mock/dashboard";
import {
  Bird,
  Heart,
  Grid3x3,
  CheckCircle2,
  Egg,
  ArrowUpRight,
  Plus,
  Activity,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "là";

  return (
    <AppShell>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue ${firstName} — voici un aperçu de votre élevage.`}
        actions={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => toast.success("Export CSV simulé — prêt pour l’API.")}
            >
              Exporter
            </Button>
            <Link
              to="/pigeons"
              hash="nouveau"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" /> Ajouter un pigeon
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pigeons"
          value={142}
          delta="+8 ce mois"
          icon={<Bird className="size-5" />}
        />
        <StatCard
          label="Couples actifs"
          value={28}
          delta="2 nouveaux"
          icon={<Heart className="size-5" />}
          tone="couple"
        />
        <StatCard
          label="Cages occupées"
          value={36}
          delta="sur 48"
          icon={<Grid3x3 className="size-5" />}
          tone="single"
        />
        <StatCard
          label="Cages libres"
          value={12}
          delta="disponibles"
          icon={<CheckCircle2 className="size-5" />}
          tone="empty"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Activité de l&apos;élevage</h3>
              <p className="text-xs text-muted-foreground">12 derniers mois</p>
            </div>
            <Badge tone="default">+12% vs N-1</Badge>
          </div>
          <ChartPlaceholder />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Reproductions récentes</h3>
            <Egg className="size-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {DASHBOARD_RECENT_REPRODUCTIONS.map((r) => (
              <li key={r.code}>
                <Link
                  to="/couples/$id"
                  params={{ id: r.code }}
                  className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-muted/60 transition-colors"
                >
                  <div className="size-9 rounded-lg bg-cage-couple-soft text-cage-couple grid place-items-center">
                    <Egg className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Couple {r.code}</div>
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  </div>
                  <Badge tone="couple">{r.jeunes} jeunes</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Fil d&apos;activité</h3>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <ol className="relative border-l border-border ml-2 space-y-5">
            {DASHBOARD_ACTIVITY.map((a, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 size-3 rounded-full bg-background border-2 border-primary" />
                <div className="text-xs text-muted-foreground">{a.time}</div>
                <div className="text-sm flex items-center gap-2 mt-0.5">{a.title}</div>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h3 className="font-semibold tracking-tight mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/pigeons"
              hash="nouveau"
              className="aspect-square rounded-xl border bg-background hover:bg-muted hover:border-primary/30 transition flex flex-col items-center justify-center gap-2 text-xs font-medium text-foreground"
            >
              <Bird className="size-5 text-primary" />
              Ajouter pigeon
            </Link>
            <Link
              to="/couples"
              className="aspect-square rounded-xl border bg-background hover:bg-muted hover:border-primary/30 transition flex flex-col items-center justify-center gap-2 text-xs font-medium text-foreground"
            >
              <Heart className="size-5 text-primary" />
              Créer couple
            </Link>
            <Link
              to="/cages"
              className="aspect-square rounded-xl border bg-background hover:bg-muted hover:border-primary/30 transition flex flex-col items-center justify-center gap-2 text-xs font-medium text-foreground"
            >
              <Grid3x3 className="size-5 text-primary" />
              Affecter cage
            </Link>
            <Link
              to="/exits"
              className="aspect-square rounded-xl border bg-background hover:bg-muted hover:border-primary/30 transition flex flex-col items-center justify-center gap-2 text-xs font-medium text-foreground"
            >
              <ArrowUpRight className="size-5 text-primary" />
              Déclarer sortie
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function ChartPlaceholder() {
  return (
    <div className="h-48 flex items-end gap-2">
      {DASHBOARD_CHART_BARS.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md bg-linear-to-t from-primary/70 to-primary/30"
            style={{ height: `${h}%` }}
          />
          <span className="text-[10px] text-muted-foreground">
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}
