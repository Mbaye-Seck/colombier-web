import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Button, Card } from "@/components/domain";
import {
  useGetCouplesPageQuery,
  useCreateCoupleMutation,
  useBreakCoupleMutation,
  useDeleteCoupleMutation,
} from "@/store/api/coupleApi";
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
import { Plus, Bird, Heart, Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

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

type StatutFilter = "" | "actif" | "rompu";

export function CouplesPage() {
  const [page, setPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("");
  const [addOpen, setAddOpen] = useState(false);
  const [breakId, setBreakId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryParams = {
    page,
    ...(statutFilter ? { "filter[statut]": statutFilter } : {}),
  };

  const { data: page_data, isLoading, isError, refetch } = useGetCouplesPageQuery(queryParams);
  const { data: pigeons = [] } = useGetPigeonsQuery();
  const [createCouple] = useCreateCoupleMutation();
  const [breakCoupleMutation] = useBreakCoupleMutation();
  const [deleteCouple] = useDeleteCoupleMutation();

  const couples = page_data?.data ?? [];
  const meta = page_data?.meta;

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
    defaultValues: {
      male_id: undefined as unknown as number,
      femelle_id: undefined as unknown as number,
      date_formation: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const couple = await createCouple(values).unwrap();
      const male = pigeons.find((p) => p.id === values.male_id);
      const femelle = pigeons.find((p) => p.id === values.femelle_id);
      toast.success(
        `Couple ${male?.code_bague ?? couple.male_id} × ${femelle?.code_bague ?? couple.femelle_id} créé.`,
      );
      setAddOpen(false);
      form.reset();
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Veuillez réessayer." });
      }
    }
  });

  const handleFilterChange = (value: StatutFilter) => {
    setStatutFilter(value);
    setPage(1);
  };

  const filterTabs: { label: string; value: StatutFilter }[] = [
    { label: "Tous", value: "" },
    { label: "Actifs", value: "actif" },
    { label: "Rompus", value: "rompu" },
  ];

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

      <ConfirmDialog
        open={breakId !== null}
        onOpenChange={(o) => !o && setBreakId(null)}
        title="Rompre ce couple ?"
        description="Cette action marquera le couple comme inactif. L'historique des reproductions est conservé."
        confirmLabel="Rompre le couple"
        onConfirm={async () => {
          if (!breakId) return;
          try {
            await breakCoupleMutation(breakId).unwrap();
            toast.success(`Couple #${breakId} rompu.`);
          } catch {
            toast.error("Impossible de rompre ce couple.");
          } finally {
            setBreakId(null);
          }
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer ce couple ?"
        description="La suppression est définitive. Un couple ayant des reproductions ou des affectations en cage ne peut pas être supprimé."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteCouple(deleteId).unwrap();
            toast.success(`Couple #${deleteId} supprimé.`);
          } catch (err) {
            const msg =
              (err as { data?: { message?: string } })?.data?.message ??
              "Ce couple ne peut pas être supprimé.";
            toast.error(msg);
          } finally {
            setDeleteId(null);
          }
        }}
      />

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) form.reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau couple</DialogTitle>
            <DialogDescription>Associez un mâle et une femelle actifs.</DialogDescription>
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
              <label className="text-xs font-medium text-muted-foreground" htmlFor="c-male">
                Pigeon mâle
              </label>
              <select
                id="c-male"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...form.register("male_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner un mâle…</option>
                {activePigeonsMale.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_bague}
                    {p.race ? ` — ${p.race}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.male_id && (
                <p className="text-xs text-destructive mt-1" role="alert">
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
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...form.register("femelle_id", { valueAsNumber: true })}
              >
                <option value="">Sélectionner une femelle…</option>
                {activePigeonsFemelle.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_bague}
                    {p.race ? ` — ${p.race}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.femelle_id && (
                <p className="text-xs text-destructive mt-1" role="alert">
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
          description={
            statutFilter
              ? "Aucun couple ne correspond au filtre sélectionné."
              : "Créez votre premier couple reproducteur pour commencer."
          }
          action={
            !statutFilter ? (
              <Button type="button" onClick={() => setAddOpen(true)}>
                Nouveau couple
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && couples.length > 0 && (
        <>
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
                        <span className="text-[11px] font-semibold text-blue-600 uppercase">
                          Mâle
                        </span>
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
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Voir détails
                    </Link>
                    {c.statut === "actif" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setBreakId(c.id)}
                      >
                        Rompre
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setDeleteId(c.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                {meta.from}–{meta.to} sur {meta.total} couples
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
