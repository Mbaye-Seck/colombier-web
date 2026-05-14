import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, StatCard, Card, Badge } from "@/components/domain";
import { useAuth } from "@/providers/auth-provider";
import { useGetPigeonPageQuery } from "@/store/api/pigeonApi";
import { useGetCouplesPageQuery } from "@/store/api/coupleApi";
import { useGetReproductionsPageQuery, useGetReproductionsQuery } from "@/store/api/reproductionApi";
import { useGetCagesQuery } from "@/store/api/cageApi";
import { useGetExitsQuery } from "@/store/api/exitApi";
import {
  Bird,
  Heart,
  Egg,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Loader2,
  Skull,
  HelpCircle,
  Banknote,
} from "lucide-react";
import type { ReproductionStatut } from "@/types/reproduction";
import type { SortieType } from "@/types/exit";

const REPRO_STATUT: Record<ReproductionStatut, { label: string; tone: "couple" | "empty" | "muted" }> = {
  en_cours: { label: "En cours", tone: "couple" },
  terminee: { label: "Terminée", tone: "empty" },
  echec: { label: "Échec", tone: "muted" },
};

const EXIT_CFG: Record<SortieType, { label: string; icon: typeof Banknote; cls: string }> = {
  vente: { label: "Vente", icon: Banknote, cls: "bg-cage-empty-soft text-cage-empty" },
  deces: { label: "Décès", icon: Skull, cls: "bg-cage-single-soft text-cage-single" },
  perte: { label: "Perte", icon: HelpCircle, cls: "bg-cage-couple-soft text-cage-couple" },
};

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.nom_complet?.split(" ")[0] ?? "là";

  // ── Stats ─────────────────────────────────────────────────────────────────
  const { data: pigeonPage } = useGetPigeonPageQuery({ per_page: 1, "filter[statut]": "actif" });
  const { data: couplePage } = useGetCouplesPageQuery({ per_page: 1, "filter[statut]": "actif" });
  const { data: reproPage } = useGetReproductionsPageQuery({ per_page: 1, "filter[statut]": "en_cours" });
  const { data: allCages = [] } = useGetCagesQuery();

  const statPigeons: number | "—" = pigeonPage?.meta.total ?? "—";
  const statCouples: number | "—" = couplePage?.meta.total ?? "—";
  const statRepros: number | "—" = reproPage?.meta.total ?? "—";
  const statFreeCages: number | "—" = allCages.length > 0
    ? allCages.filter((c) => c.status === "empty").length
    : "—";

  // ── Recent data ───────────────────────────────────────────────────────────
  const { data: recentRepros = [], isLoading: loadingRepros } = useGetReproductionsQuery({ per_page: 5 });
  const { data: exits = [], isLoading: loadingExits } = useGetExitsQuery();
  const recentExits = useMemo(() => exits.slice(0, 5), [exits]);

  return (
    <AppShell>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue ${firstName} — voici un aperçu de votre élevage.`}
        actions={
          <Link
            to="/pigeons"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> Ajouter un pigeon
          </Link>
        }
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pigeons actifs"
          value={statPigeons}
          icon={<Bird className="size-5" />}
        />
        <StatCard
          label="Couples actifs"
          value={statCouples}
          icon={<Heart className="size-5" />}
          tone="couple"
        />
        <StatCard
          label="Repros en cours"
          value={statRepros}
          icon={<Egg className="size-5" />}
          tone="single"
        />
        <StatCard
          label="Cages libres"
          value={statFreeCages}
          icon={<CheckCircle2 className="size-5" />}
          tone="empty"
        />
      </div>

      {/* ── Recent reproductions + quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Reproductions récentes</h3>
            <Link to="/reproductions" className="text-xs text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          {loadingRepros ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Chargement…
            </div>
          ) : recentRepros.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Aucune reproduction enregistrée.
            </p>
          ) : (
            <ul className="divide-y -mx-1">
              {recentRepros.map((r) => {
                const cfg = REPRO_STATUT[r.statut];
                return (
                  <li key={r.id}>
                    <Link
                      to="/reproductions/$id"
                      params={{ id: String(r.id) }}
                      className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="size-9 rounded-lg bg-cage-couple-soft text-cage-couple grid place-items-center shrink-0">
                        <Egg className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {r.couple
                            ? `${r.couple.male?.code_bague ?? "—"} × ${r.couple.femelle?.code_bague ?? "—"}`
                            : `Couple #${r.couple_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.date_ponte}</div>
                      </div>
                      <Badge tone={cfg.tone}>{cfg.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold tracking-tight mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/pigeons"
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
              <Egg className="size-5 text-primary" />
              Reproductions
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

      {/* ── Recent exits ── */}
      <div className="mt-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Sorties récentes</h3>
            <Link to="/exits" className="text-xs text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          {loadingExits ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Chargement…
            </div>
          ) : recentExits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Aucune sortie enregistrée.
            </p>
          ) : (
            <ul className="divide-y -mx-1">
              {recentExits.map((e) => {
                const cfg = EXIT_CFG[e.type_sortie];
                const Icon = cfg.icon;
                return (
                  <li key={e.id}>
                    <Link
                      to="/exits/$id"
                      params={{ id: String(e.id) }}
                      className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`size-9 rounded-lg grid place-items-center shrink-0 ${cfg.cls}`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium font-mono truncate">
                          {e.pigeon?.code_bague ?? `Pigeon #${e.pigeon_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">{e.date_sortie}</div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{cfg.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
