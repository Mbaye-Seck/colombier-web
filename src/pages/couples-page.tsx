import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Button, Card } from "@/components/domain";
import { useGetCouplesQuery, useCreateCoupleMutation, useBreakCoupleMutation } from "@/store/api/coupleApi";
import { useGetPigeonsQuery } from "@/store/api/pigeonApi";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
import { InputField } from "@/components/ui/form-field";
import { coupleCreateSchema, type CoupleCreateValues } from "@/lib/schemas/couple";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Bird, Heart, Loader2 } from "lucide-react";

export function CouplesPage() {
  const { data: couples = [], isLoading, isError, refetch } = useGetCouplesQuery();
  const { data: pigeons = [] } = useGetPigeonsQuery();
  const [createCouple] = useCreateCoupleMutation();
  const [breakCoupleMutation] = useBreakCoupleMutation();
  const [addOpen, setAddOpen] = useState(false);
  const [breakId, setBreakId] = useState<number | null>(null);

  const activePigeonsMale = useMemo(
    () => pigeons.filter((p) => p.sexe === "male" && p.statut === "actif"),
    [pigeons],
  );
  const activePigeonsFemelle = useMemo(
    () => pigeons.filter((p) => p.sexe === "femelle" && p.statut === "actif"),
    [pigeons],
  );

  const form = useForm<CoupleCreateValues>({
    resolver: zodResolver(coupleCreateSchema),
    defaultValues: { male_id: undefined as unknown as number, femelle_id: undefined as unknown as number, date_formation: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createCouple(values).unwrap();
    const male = pigeons.find((p) => p.id === values.male_id);
    const femelle = pigeons.find((p) => p.id === values.femelle_id);
    toast.success(
      `Couple ${male?.code_bague ?? values.male_id} × ${femelle?.code_bague ?? values.femelle_id} créé.`,
    );
    setAddOpen(false);
    form.reset();
  });

  return (
    <AppShell>
      <PageHeader
        title="Couples"
        subtitle="Gestion des couples reproducteurs."
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Nouveau couple
          </Button>
        }
      />

      <ConfirmDialog
        open={breakId !== null}
        onOpenChange={(o) => !o && setBreakId(null)}
        title="Rompre ce couple ?"
        description="Cette action marquera le couple comme inactif. L'historique des reproductions est conservé."
        confirmLabel="Rompre le couple"
        onConfirm={async () => {
          if (!breakId) return;
          await breakCoupleMutation(breakId).unwrap();
          toast.success(`Couple #${breakId} rompu.`);
          setBreakId(null);
        }}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau couple</DialogTitle>
            <DialogDescription>Associez un mâle et une femelle.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="c-male">
                Pigeon mâle
              </label>
              <select
                id="c-male"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm"
                {...form.register("male_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner un mâle…</option>
                {activePigeonsMale.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.male_id && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.male_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="c-femelle">
                Pigeon femelle
              </label>
              <select
                id="c-femelle"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm"
                {...form.register("femelle_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner une femelle…</option>
                {activePigeonsFemelle.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.femelle_id && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.femelle_id.message}
                </p>
              )}
            </div>
            <InputField
              id="c-date"
              label="Date de formation"
              type="date"
              error={form.formState.errors.date_formation?.message}
              {...form.register("date_formation")}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Créer le couple"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading && <LoadingSpinner label="Chargement des couples…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger les couples." onRetry={() => refetch()} />
      )}
      {!isLoading && !isError && couples.length === 0 && (
        <EmptyState
          title="Aucun couple enregistré."
          description="Créez votre premier couple reproducteur pour commencer."
          action={
            <Button type="button" onClick={() => setAddOpen(true)}>
              Nouveau couple
            </Button>
          }
        />
      )}

      {!isLoading && !isError && couples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {couples.map((c) => {
            const maleBague = c.male?.code_bague ?? `ID ${c.male_id}`;
            const femelleBague = c.femelle?.code_bague ?? `ID ${c.femelle_id}`;
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Couple</div>
                    <div className="font-semibold tracking-tight">#{c.id}</div>
                  </div>
                  <Badge tone={c.statut === "actif" ? "empty" : "muted"}>
                    {c.statut === "actif" ? "Actif" : "Rompu"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl border p-3 bg-blue-500/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="size-7 rounded-lg bg-blue-500/15 text-blue-600 grid place-items-center">
                        <Bird className="size-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase">Mâle</span>
                    </div>
                    <div className="font-mono text-xs">{maleBague}</div>
                  </div>
                  <Heart className="size-5 text-cage-couple shrink-0" fill="currentColor" />
                  <div className="flex-1 rounded-xl border p-3 bg-pink-500/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="size-7 rounded-lg bg-pink-500/15 text-pink-600 grid place-items-center">
                        <Bird className="size-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-pink-600 uppercase">
                        Femelle
                      </span>
                    </div>
                    <div className="font-mono text-xs">{femelleBague}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Formé le</div>
                    <div className="font-medium">{c.date_formation}</div>
                  </div>
                  {c.date_rupture && (
                    <div>
                      <div className="text-muted-foreground">Rompu le</div>
                      <div className="font-medium">{c.date_rupture}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to="/couples/$id"
                    params={{ id: String(c.id) }}
                    className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    Voir détails
                  </Link>
                  {c.statut === "actif" && (
                    <Button variant="ghost" size="sm" type="button" onClick={() => setBreakId(c.id)}>
                      Rompre
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
