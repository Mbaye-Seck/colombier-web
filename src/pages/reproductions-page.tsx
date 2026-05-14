import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Badge, Button, StatCard } from "@/components/domain";
import {
  useGetReproductionsPageQuery,
  useCreateReproductionMutation,
} from "@/store/api/reproductionApi";
import { useGetCouplesQuery } from "@/store/api/coupleApi";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
import { InputField, TextareaField } from "@/components/ui/form-field";
import {
  reproductionCreateSchema,
  type ReproductionCreateValues,
} from "@/lib/schemas/reproduction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Egg, Bird, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Reproduction } from "@/types/reproduction";

function applyApiErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  const errors = (err as { data?: { errors?: Record<string, string[]> } })?.data?.errors;
  if (!errors) return false;
  for (const [field, messages] of Object.entries(errors)) {
    setError(field as Path<T>, { message: messages[0] });
  }
  return true;
}

type StatutFilter = "" | "en_cours" | "terminee" | "echec";

export function ReproductionsPage() {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("");
  const [addOpen, setAddOpen] = useState(false);

  const queryParams = {
    page,
    ...(statutFilter ? { "filter[statut]": statutFilter } : {}),
  };

  const { data: page_data, isLoading, isError, refetch } = useGetReproductionsPageQuery(queryParams);
  const { data: couples = [] } = useGetCouplesQuery();
  const [createReproduction] = useCreateReproductionMutation();

  const repros = page_data?.data ?? [];
  const meta = page_data?.meta;

  // Stats from current page (accurate only when no filter active)
  const totalJeunes = repros.reduce((s, r) => s + (r.nombre_jeunes ?? 0), 0);
  const enIncubation = repros.filter((r) => r.statut === "en_cours").length;
  const terminees = repros.filter((r) => r.statut === "terminee").length;
  const tauxReussite =
    repros.length > 0 ? `${Math.round((terminees / repros.length) * 100)}%` : "—";

  const activeCouples = useMemo(
    () => couples.filter((c) => c.statut === "actif"),
    [couples],
  );

  const form = useForm<ReproductionCreateValues>({
    resolver: zodResolver(reproductionCreateSchema),
    defaultValues: {
      couple_id: undefined as unknown as number,
      date_ponte: "",
      date_eclosion: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      date_eclosion: values.date_eclosion || null,
      notes: values.notes || null,
    };
    try {
      const repro = await createReproduction(payload).unwrap();
      toast.success(`Reproduction #${repro.id} pour le couple #${repro.couple_id} enregistrée.`);
      setAddOpen(false);
      form.reset();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Veuillez réessayer." });
      }
    }
  });

  const filterTabs: { label: string; value: StatutFilter }[] = [
    { label: "Toutes", value: "" },
    { label: "En cours", value: "en_cours" },
    { label: "Terminées", value: "terminee" },
    { label: "Échec", value: "echec" },
  ];

  const handleFilterChange = (value: StatutFilter) => {
    setStatutFilter(value);
    setPage(1);
  };

  return (
    <AppShell>
      <PageHeader
        title="Reproductions"
        subtitle="Suivi des pontes, éclosions et descendances."
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Nouvelle reproduction
          </Button>
        }
      />

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) form.reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle reproduction</DialogTitle>
            <DialogDescription>Enregistrez une nouvelle ponte pour un couple actif.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {form.formState.errors.root && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              >
                {form.formState.errors.root.message}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="r-couple">
                Couple
              </label>
              <select
                id="r-couple"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...form.register("couple_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner un couple actif…</option>
                {activeCouples.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.male?.code_bague ?? `ID ${c.male_id}`} ×{" "}
                    {c.femelle?.code_bague ?? `ID ${c.femelle_id}`}
                  </option>
                ))}
              </select>
              {form.formState.errors.couple_id && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.couple_id.message}
                </p>
              )}
            </div>
            <InputField
              id="r-ponte"
              label="Date de ponte"
              type="date"
              error={form.formState.errors.date_ponte?.message}
              {...form.register("date_ponte")}
            />
            <InputField
              id="r-eclosion"
              label="Date d'éclosion (optionnel)"
              type="date"
              error={form.formState.errors.date_eclosion?.message}
              {...form.register("date_eclosion")}
            />
            <TextareaField
              id="r-notes"
              label="Notes (optionnel)"
              placeholder="Observations particulières…"
              error={form.formState.errors.notes?.message}
              {...form.register("notes")}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setAddOpen(false); form.reset(); }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total"
          value={meta?.total ?? repros.length}
          icon={<Egg className="size-5" />}
          tone="couple"
        />
        <StatCard
          label="Jeunes éclos"
          value={totalJeunes}
          icon={<Bird className="size-5" />}
          tone="empty"
        />
        <StatCard
          label="En incubation"
          value={enIncubation}
          icon={<Egg className="size-5" />}
          tone="single"
        />
        <StatCard label="Taux de réussite" value={tauxReussite} icon={<Egg className="size-5" />} />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleFilterChange(tab.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statutFilter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner label="Chargement des reproductions…" />}
      {isError && (
        <ErrorAlert
          message="Impossible de charger les reproductions."
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !isError && repros.length === 0 && (
        <EmptyState
          title="Aucune reproduction enregistrée."
          description={
            statutFilter
              ? "Aucune reproduction ne correspond au filtre sélectionné."
              : "Ajoutez votre première reproduction pour commencer le suivi."
          }
        />
      )}

      {!isLoading && !isError && repros.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {repros.map((r) => (
              <ReproductionCard key={r.id} r={r} />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                {meta.from}–{meta.to} sur {meta.total} reproductions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="flex h-8 items-center px-3 text-sm">
                  {page} / {meta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.last_page}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

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

function ReproductionCard({ r }: { r: Reproduction }) {
  const maleBague = r.couple?.male?.code_bague ?? "—";
  const femelleBague = r.couple?.femelle?.code_bague ?? "—";
  const pigeons = r.pigeons ?? [];

  return (
    <Card className="hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Reproduction</div>
          <div className="font-semibold tracking-tight">
            #{r.id} · Couple #{r.couple_id}
          </div>
        </div>
        <Badge tone={STATUT_TONES[r.statut]}>{STATUT_LABELS[r.statut]}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-2">
          <ParentChip ring={maleBague} sex="M" />
          <ParentChip ring={femelleBague} sex="F" />
        </div>
        {pigeons.length > 0 && (
          <>
            <div className="w-8 border-t-2 border-dashed border-border" />
            <div className="flex-1 space-y-2">
              {pigeons.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cage-empty-soft border border-cage-empty-border"
                >
                  <Bird className="size-4 text-cage-empty" />
                  <span className="font-mono text-xs">{p.code_bague}</span>
                </div>
              ))}
              {pigeons.length > 3 && (
                <div className="text-xs text-muted-foreground px-3">
                  +{pigeons.length - 3} autre{pigeons.length - 3 > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t text-xs">
        <div>
          <div className="text-muted-foreground">Ponte</div>
          <div className="font-medium">{r.date_ponte}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Éclosion</div>
          <div className="font-medium">{r.date_eclosion ?? "—"}</div>
        </div>
      </div>
      <div className="mt-4">
        <Link
          to="/reproductions/$id"
          params={{ id: String(r.id) }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ouvrir la fiche →
        </Link>
      </div>
    </Card>
  );
}

function ParentChip({ ring, sex }: { ring: string; sex: "M" | "F" }) {
  const cls =
    sex === "M"
      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
      : "bg-pink-500/10 text-pink-600 border-pink-500/20";
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cls}`}>
      <Bird className="size-4" />
      <span className="font-mono text-xs">{ring}</span>
      <span className="ml-auto text-[10px] font-semibold uppercase">
        {sex === "M" ? "Mâle" : "Femelle"}
      </span>
    </div>
  );
}
