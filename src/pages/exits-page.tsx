import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Badge, Button, StatCard } from "@/components/domain";
import { useGetExitsQuery, useCreateExitMutation } from "@/store/api/exitApi";
import { useGetPigeonsQuery } from "@/store/api/pigeonApi";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
import { InputField, SelectField, TextareaField } from "@/components/ui/form-field";
import { exitCreateSchema, type ExitCreateValues } from "@/lib/schemas/exit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sortie, SortieType } from "@/types/exit";
import { Plus, ArrowUpRight, Skull, HelpCircle, Banknote, Loader2 } from "lucide-react";

const TYPE_CONFIG: Record<SortieType, { tone: "empty" | "single" | "couple"; icon: typeof Banknote; label: string }> = {
  vente: { tone: "empty", icon: Banknote, label: "Vente" },
  deces: { tone: "single", icon: Skull, label: "Décès" },
  perte: { tone: "couple", icon: HelpCircle, label: "Perte" },
};

const FILTER_OPTIONS: { value: "tous" | SortieType; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "vente", label: "Vente" },
  { value: "deces", label: "Décès" },
  { value: "perte", label: "Perte" },
];

type ExitFilter = "tous" | SortieType;

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

export function ExitsPage() {
  const { data: exits = [], isLoading, isError, refetch } = useGetExitsQuery();
  const { data: pigeons = [] } = useGetPigeonsQuery();
  const [createExit] = useCreateExitMutation();
  const [filter, setFilter] = useState<ExitFilter>("tous");
  const [addOpen, setAddOpen] = useState(false);

  const activePigeons = useMemo(() => pigeons.filter((p) => p.statut === "actif"), [pigeons]);

  const filtered = useMemo(
    () => exits.filter((e) => filter === "tous" || e.type_sortie === filter),
    [exits, filter],
  );

  const ventes = exits.filter((e) => e.type_sortie === "vente").length;
  const deces = exits.filter((e) => e.type_sortie === "deces").length;
  const pertes = exits.filter((e) => e.type_sortie === "perte").length;

  const form = useForm<ExitCreateValues>({
    resolver: zodResolver(exitCreateSchema),
    defaultValues: {
      pigeon_id: undefined as unknown as number,
      type_sortie: "vente",
      date_sortie: "",
      prix: undefined,
      acheteur: "",
      cause: "",
      circonstance: "",
    },
  });
  const exitType = form.watch("type_sortie");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createExit(values).unwrap();
      const pigeon = activePigeons.find((p) => p.id === values.pigeon_id);
      toast.success(`Sortie ${TYPE_CONFIG[values.type_sortie].label} pour ${pigeon?.code_bague ?? `#${values.pigeon_id}`} enregistrée.`);
      setAddOpen(false);
      form.reset();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Veuillez réessayer." });
      }
    }
  });

  return (
    <AppShell>
      <PageHeader
        title="Sorties"
        subtitle="Ventes, décès et pertes — historique complet."
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Nouvelle sortie
          </Button>
        }
      />

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) form.reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle sortie</DialogTitle>
            <DialogDescription>Enregistrez une vente, un décès ou une perte.</DialogDescription>
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
              <label className="text-xs font-medium text-muted-foreground" htmlFor="e-pigeon">
                Pigeon
              </label>
              <select
                id="e-pigeon"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...form.register("pigeon_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner un pigeon actif…</option>
                {activePigeons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.pigeon_id && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.pigeon_id.message}
                </p>
              )}
            </div>
            <SelectField
              id="e-type"
              label="Type de sortie"
              error={form.formState.errors.type_sortie?.message}
              {...form.register("type_sortie")}
            >
              <option value="vente">Vente</option>
              <option value="deces">Décès</option>
              <option value="perte">Perte</option>
            </SelectField>
            <InputField
              id="e-date"
              label="Date"
              type="date"
              error={form.formState.errors.date_sortie?.message}
              {...form.register("date_sortie")}
            />
            {exitType === "vente" && (
              <>
                <InputField
                  id="e-acheteur"
                  label="Acheteur"
                  placeholder="Nom de l'acheteur"
                  error={form.formState.errors.acheteur?.message}
                  {...form.register("acheteur")}
                />
                <InputField
                  id="e-prix"
                  label="Prix (optionnel)"
                  type="number"
                  placeholder="ex : 150"
                  error={form.formState.errors.prix?.message}
                  {...form.register("prix", { valueAsNumber: true })}
                />
              </>
            )}
            {exitType === "deces" && (
              <TextareaField
                id="e-cause"
                label="Cause du décès"
                placeholder="Décrivez la cause…"
                error={form.formState.errors.cause?.message}
                {...form.register("cause")}
              />
            )}
            {exitType === "perte" && (
              <TextareaField
                id="e-circonstance"
                label="Circonstance"
                placeholder="Décrivez les circonstances…"
                error={form.formState.errors.circonstance?.message}
                {...form.register("circonstance")}
              />
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
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
          label="Ventes du mois"
          value={ventes}
          icon={<Banknote className="size-5" />}
          tone="empty"
        />
        <StatCard label="Décès" value={deces} icon={<Skull className="size-5" />} tone="single" />
        <StatCard
          label="Pertes"
          value={pertes}
          icon={<HelpCircle className="size-5" />}
          tone="couple"
        />
        <StatCard
          label="Total sorties"
          value={exits.length}
          icon={<ArrowUpRight className="size-5" />}
        />
      </div>

      {isLoading && <LoadingSpinner label="Chargement des sorties…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger les sorties." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && (
        <Card className="p-0! overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={filter === "tous" ? "Aucune sortie enregistrée." : `Aucune sortie de type "${TYPE_CONFIG[filter as SortieType]?.label ?? filter}".`}
              description="Modifiez le filtre pour voir d'autres sorties."
            />
          ) : (
            <ol className="relative">
              {filtered.map((e, i) => (
                <ExitRow key={e.id} exit={e} index={i} total={filtered.length} />
              ))}
            </ol>
          )}
        </Card>
      )}
    </AppShell>
  );
}

function ExitRow({ exit: e, index: i, total }: { exit: Sortie; index: number; total: number }) {
  const cfg = TYPE_CONFIG[e.type_sortie];
  const Icon = cfg.icon;
  const pigeonLabel = e.pigeon?.code_bague ?? `#${e.pigeon_id}`;
  const toneCls =
    cfg.tone === "empty"
      ? "bg-cage-empty-soft text-cage-empty"
      : cfg.tone === "single"
        ? "bg-cage-single-soft text-cage-single"
        : "bg-cage-couple-soft text-cage-couple";
  return (
    <li className="border-b last:border-0 hover:bg-muted/30">
      <Link
        to="/exits/$id"
        params={{ id: String(e.id) }}
        className="flex gap-4 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <div className="relative">
          <div className={`size-10 rounded-xl grid place-items-center ${toneCls}`}>
            <Icon className="size-5" />
          </div>
          {i < total - 1 && (
            <div className="absolute left-1/2 top-10 -bottom-4 w-px bg-border -translate-x-1/2" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium">{pigeonLabel}</span>
            <Badge tone={cfg.tone}>{cfg.label}</Badge>
            <span className="text-xs text-muted-foreground ml-auto">{e.date_sortie}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {e.type_sortie === "vente" && (
              <>
                Vendu à <span className="text-foreground font-medium">{e.acheteur ?? "—"}</span>
                {e.prix != null && (
                  <> pour <span className="text-foreground font-medium">{e.prix} €</span></>
                )}
              </>
            )}
            {e.type_sortie === "deces" && <>Cause : {e.cause ?? "—"}</>}
            {e.type_sortie === "perte" && <>Circonstance : {e.circonstance ?? "—"}</>}
          </div>
        </div>
      </Link>
    </li>
  );
}
