import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Badge, Button, StatCard } from "@/components/domain";
import { useGetReproductionsQuery, useCreateReproductionMutation } from "@/store/api/reproductionApi";
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
import { Plus, Egg, Bird, Loader2 } from "lucide-react";

export function ReproductionsPage() {
  const { data: repros = [], isLoading, isError, refetch } = useGetReproductionsQuery();
  const [createReproduction] = useCreateReproductionMutation();
  const totalJeunes = repros.reduce((s, r) => s + r.jeunes, 0);
  const [addOpen, setAddOpen] = useState(false);

  const form = useForm<ReproductionCreateValues>({
    resolver: zodResolver(reproductionCreateSchema),
    defaultValues: { coupleId: "", ponte: "", eclosionPrevue: "", notes: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createReproduction(values).unwrap();
    toast.success(`Reproduction pour le couple ${values.coupleId} enregistrée.`);
    setAddOpen(false);
    form.reset();
  });

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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle reproduction</DialogTitle>
            <DialogDescription>Enregistrez une nouvelle ponte pour un couple.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              id="r-couple"
              label="Identifiant du couple"
              placeholder="ex : C-001"
              error={form.formState.errors.coupleId?.message}
              {...form.register("coupleId")}
            />
            <InputField
              id="r-ponte"
              label="Date de ponte"
              type="date"
              error={form.formState.errors.ponte?.message}
              {...form.register("ponte")}
            />
            <InputField
              id="r-eclosion"
              label="Éclosion prévue (optionnel)"
              type="date"
              error={form.formState.errors.eclosionPrevue?.message}
              {...form.register("eclosionPrevue")}
            />
            <TextareaField
              id="r-notes"
              label="Notes (optionnel)"
              placeholder="Observations particulières…"
              error={form.formState.errors.notes?.message}
              {...form.register("notes")}
            />
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
          label="Reproductions"
          value={repros.length}
          icon={<Egg className="size-5" />}
          tone="couple"
        />
        <StatCard
          label="Jeunes éclos"
          value={totalJeunes}
          icon={<Bird className="size-5" />}
          tone="empty"
        />
        <StatCard label="En incubation" value={6} icon={<Egg className="size-5" />} tone="single" />
        <StatCard label="Taux de réussite" value="84%" icon={<Egg className="size-5" />} />
      </div>

      {isLoading && <LoadingSpinner label="Chargement des reproductions…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger les reproductions." onRetry={() => refetch()} />
      )}
      {!isLoading && !isError && repros.length === 0 && (
        <EmptyState
          title="Aucune reproduction enregistrée."
          description="Ajoutez votre première reproduction pour commencer le suivi."
        />
      )}

      {!isLoading && !isError && repros.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {repros.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Reproduction</div>
                  <div className="font-semibold tracking-tight">
                    {r.id} · Couple {r.couple}
                  </div>
                </div>
                <Badge tone="couple">
                  {r.jeunes} jeune{r.jeunes > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <ParentChip ring={r.pere} sex="M" />
                  <ParentChip ring={r.mere} sex="F" />
                </div>
                <div className="w-8 border-t-2 border-dashed border-border" />
                <div className="flex-1 space-y-2">
                  {r.jeunesIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cage-empty-soft border border-cage-empty-border"
                    >
                      <Bird className="size-4 text-cage-empty" />
                      <span className="font-mono text-xs">{id}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t text-xs">
                <div>
                  <div className="text-muted-foreground">Ponte</div>
                  <div className="font-medium">{r.ponte}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Éclosion</div>
                  <div className="font-medium">{r.eclosion}</div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/reproductions/$id"
                  params={{ id: r.id }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ouvrir la fiche détaillée
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
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
