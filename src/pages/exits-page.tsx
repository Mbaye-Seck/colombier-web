import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Badge, Button, StatCard } from "@/components/domain";
import { useGetExitsQuery, useCreateExitMutation } from "@/store/api/exitApi";
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
import type { Exit, ExitKind } from "@/types/exit";
import { Plus, ArrowUpRight, Skull, HelpCircle, Banknote, Loader2 } from "lucide-react";

const TYPE_CONFIG = {
  Vente: { tone: "empty" as const, icon: Banknote },
  Décès: { tone: "single" as const, icon: Skull },
  Perte: { tone: "couple" as const, icon: HelpCircle },
};

type ExitFilter = "Tous" | ExitKind;

export function ExitsPage() {
  const { data: exits = [], isLoading, isError, refetch } = useGetExitsQuery();
  const [createExit] = useCreateExitMutation();
  const [filter, setFilter] = useState<ExitFilter>("Tous");
  const [addOpen, setAddOpen] = useState(false);
  const filtered = useMemo(
    () => exits.filter((e) => filter === "Tous" || e.type === filter),
    [exits, filter],
  );

  const ventes = exits.filter((e) => e.type === "Vente").length;
  const deces = exits.filter((e) => e.type === "Décès").length;
  const pertes = exits.filter((e) => e.type === "Perte").length;

  const form = useForm<ExitCreateValues>({
    resolver: zodResolver(exitCreateSchema),
    defaultValues: { ring: "", type: "Vente", date: "", prix: "", acheteur: "", cause: "" },
  });
  const exitType = form.watch("type");

  const onSubmit = form.handleSubmit(async (values) => {
    await createExit(values).unwrap();
    toast.success(`Sortie ${values.type} pour ${values.ring} enregistrée.`);
    setAddOpen(false);
    form.reset();
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle sortie</DialogTitle>
            <DialogDescription>Enregistrez une vente, un décès ou une perte.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              id="e-ring"
              label="Matricule du pigeon"
              placeholder="ex : FR-2023-001"
              error={form.formState.errors.ring?.message}
              {...form.register("ring")}
            />
            <SelectField
              id="e-type"
              label="Type de sortie"
              error={form.formState.errors.type?.message}
              {...form.register("type")}
            >
              <option value="Vente">Vente</option>
              <option value="Décès">Décès</option>
              <option value="Perte">Perte</option>
            </SelectField>
            <InputField
              id="e-date"
              label="Date"
              type="date"
              error={form.formState.errors.date?.message}
              {...form.register("date")}
            />
            {exitType === "Vente" && (
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
                  placeholder="ex : 150 €"
                  error={form.formState.errors.prix?.message}
                  {...form.register("prix")}
                />
              </>
            )}
            {(exitType === "Décès" || exitType === "Perte") && (
              <TextareaField
                id="e-cause"
                label={exitType === "Décès" ? "Cause du décès" : "Circonstance"}
                placeholder="Décrivez les circonstances…"
                error={form.formState.errors.cause?.message}
                {...form.register("cause")}
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
            {(["Tous", "Vente", "Décès", "Perte"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={`Aucune sortie de type "${filter}".`}
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

function ExitRow({ exit: e, index: i, total }: { exit: Exit; index: number; total: number }) {
  const cfg = TYPE_CONFIG[e.type];
  const Icon = cfg.icon;
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
        params={{ id: e.id }}
        className="flex gap-4 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <div className="relative">
          <div className={`size-10 rounded-xl grid place-items-center ${toneCls}`}>
            <Icon className="size-5" />
          </div>
          {i < total - 1 && (
            <div className="absolute left-1/2 top-10 bottom-[-1rem] w-px bg-border -translate-x-1/2" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium">{e.ring}</span>
            <Badge tone={cfg.tone}>{e.type}</Badge>
            <span className="text-xs text-muted-foreground ml-auto">{e.date}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {e.type === "Vente" && (
              <>
                Vendu à <span className="text-foreground font-medium">{e.acheteur}</span> pour{" "}
                <span className="text-foreground font-medium">{e.prix}</span>
              </>
            )}
            {e.type === "Décès" && <>Cause : {e.cause}</>}
            {e.type === "Perte" && <>Circonstance : {e.cause}</>}
          </div>
        </div>
      </Link>
    </li>
  );
}
