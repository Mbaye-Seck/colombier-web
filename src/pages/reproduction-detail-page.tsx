import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm, useFieldArray } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Bird, Egg, Pencil, Trash2, Plus, X, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card, Button } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InputField, TextareaField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetReproductionQuery,
  useUpdateReproductionMutation,
  useDeleteReproductionMutation,
  useGenerateOffspringMutation,
} from "@/store/api/reproductionApi";
import {
  reproductionUpdateSchema,
  generateOffspringSchema,
  type ReproductionUpdateValues,
  type GenerateOffspringValues,
} from "@/lib/schemas/reproduction";
import type { Reproduction } from "@/types/reproduction";

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

function EditReproductionDialog({
  reproduction,
  open,
  onOpenChange,
}: {
  reproduction: Reproduction;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateReproduction] = useUpdateReproductionMutation();
  const isEchec = reproduction.statut === "echec";

  const form = useForm<ReproductionUpdateValues>({
    resolver: zodResolver(reproductionUpdateSchema),
    defaultValues: {
      statut: reproduction.statut,
      date_ponte: reproduction.date_ponte,
      date_eclosion: reproduction.date_eclosion ?? "",
      nombre_jeunes: reproduction.nombre_jeunes ?? undefined,
      notes: reproduction.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        statut: reproduction.statut,
        date_ponte: reproduction.date_ponte,
        date_eclosion: reproduction.date_eclosion ?? "",
        nombre_jeunes: reproduction.nombre_jeunes ?? undefined,
        notes: reproduction.notes ?? "",
      });
    }
  }, [open, reproduction, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: ReproductionUpdateValues = {
      statut: values.statut,
      notes: values.notes || null,
      ...(isEchec
        ? {}
        : {
            date_ponte: values.date_ponte || undefined,
            date_eclosion: values.date_eclosion || null,
            nombre_jeunes:
              values.nombre_jeunes != null && values.nombre_jeunes !== (undefined as unknown)
                ? values.nombre_jeunes
                : null,
          }),
    };
    try {
      await updateReproduction({ id: reproduction.id, data: payload }).unwrap();
      toast.success("Reproduction mise à jour.");
      onOpenChange(false);
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Veuillez réessayer." });
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) form.reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la reproduction #{reproduction.id}</DialogTitle>
          {isEchec && (
            <DialogDescription className="text-amber-600">
              Cette reproduction est en échec — seules les notes peuvent être modifiées.
            </DialogDescription>
          )}
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
          {!isEchec && (
            <>
              <div>
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="edit-r-statut"
                >
                  Statut
                </label>
                <select
                  id="edit-r-statut"
                  className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                  {...form.register("statut")}
                >
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                  <option value="echec">Échec</option>
                </select>
                {form.formState.errors.statut && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {form.formState.errors.statut.message}
                  </p>
                )}
              </div>
              <InputField
                id="edit-r-ponte"
                label="Date de ponte"
                type="date"
                error={form.formState.errors.date_ponte?.message}
                {...form.register("date_ponte")}
              />
              <InputField
                id="edit-r-eclosion"
                label="Date d'éclosion (optionnel)"
                type="date"
                error={form.formState.errors.date_eclosion?.message}
                {...form.register("date_eclosion")}
              />
              <div>
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="edit-r-jeunes"
                >
                  Nombre de jeunes
                </label>
                <input
                  id="edit-r-jeunes"
                  type="number"
                  min={0}
                  max={255}
                  className="mt-1.5 flex h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  {...form.register("nombre_jeunes", { valueAsNumber: true })}
                />
                {form.formState.errors.nombre_jeunes && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {form.formState.errors.nombre_jeunes.message}
                  </p>
                )}
              </div>
            </>
          )}
          <TextareaField
            id="edit-r-notes"
            label="Notes"
            placeholder="Observations particulières…"
            error={form.formState.errors.notes?.message}
            {...form.register("notes")}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); form.reset(); }}
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
  );
}

function GenerateOffspringDialog({
  reproduction,
  open,
  onOpenChange,
}: {
  reproduction: Reproduction;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [generateOffspring] = useGenerateOffspringMutation();

  const form = useForm<GenerateOffspringValues>({
    resolver: zodResolver(generateOffspringSchema),
    defaultValues: {
      pigeons: [{ code_bague: "", sexe: "male", couleur: "", date_naissance: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "pigeons" });

  useEffect(() => {
    if (open) {
      form.reset({
        pigeons: [{ code_bague: "", sexe: "male", couleur: "", date_naissance: "" }],
      });
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: GenerateOffspringValues = {
      pigeons: values.pigeons.map((p) => ({
        code_bague: p.code_bague.trim(),
        sexe: p.sexe,
        couleur: p.couleur?.trim() || undefined,
        date_naissance: p.date_naissance || null,
      })),
    };
    try {
      const offspring = await generateOffspring({
        reproductionId: reproduction.id,
        data: payload,
      }).unwrap();
      toast.success(
        `${offspring.length} juvénile${offspring.length > 1 ? "s" : ""} généré${offspring.length > 1 ? "s" : ""} avec succès.`,
      );
      onOpenChange(false);
    } catch (err) {
      // Surface array-level error ("pigeons" key) as root
      const errors = (err as { data?: { errors?: Record<string, string[]> } })?.data?.errors;
      if (errors?.pigeons) {
        form.setError("root", { message: errors.pigeons[0] });
      } else if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Veuillez réessayer." });
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) form.reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Générer les juvéniles</DialogTitle>
          <DialogDescription>
            Saisissez les informations de chaque jeune né de cette reproduction. Les codes bague
            doivent être uniques.
          </DialogDescription>
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

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative grid grid-cols-[1fr_auto_1fr_1fr] gap-2 items-start p-3 rounded-lg border bg-muted/30"
              >
                <div>
                  <label
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                    htmlFor={`p-${index}-bague`}
                  >
                    Code bague *
                  </label>
                  <input
                    id={`p-${index}-bague`}
                    type="text"
                    placeholder="ABC-2024-001"
                    className="mt-1 flex h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    {...form.register(`pigeons.${index}.code_bague`)}
                  />
                  {form.formState.errors.pigeons?.[index]?.code_bague && (
                    <p className="text-xs text-destructive mt-0.5">
                      {form.formState.errors.pigeons[index]?.code_bague?.message}
                    </p>
                  )}
                </div>
                <div className="min-w-[90px]">
                  <label
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                    htmlFor={`p-${index}-sexe`}
                  >
                    Sexe *
                  </label>
                  <select
                    id={`p-${index}-sexe`}
                    className="mt-1 flex h-8 w-full rounded-md border bg-background px-2 text-sm cursor-pointer"
                    {...form.register(`pigeons.${index}.sexe`)}
                  >
                    <option value="male">Mâle</option>
                    <option value="femelle">Femelle</option>
                  </select>
                </div>
                <div>
                  <label
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                    htmlFor={`p-${index}-couleur`}
                  >
                    Couleur
                  </label>
                  <input
                    id={`p-${index}-couleur`}
                    type="text"
                    placeholder="Optionnel"
                    className="mt-1 flex h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    {...form.register(`pigeons.${index}.couleur`)}
                  />
                </div>
                <div>
                  <label
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
                    htmlFor={`p-${index}-naissance`}
                  >
                    Né le
                  </label>
                  <input
                    id={`p-${index}-naissance`}
                    type="date"
                    className="mt-1 flex h-8 w-full rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    {...form.register(`pigeons.${index}.date_naissance`)}
                  />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 size-5 rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Supprimer ce jeune"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ code_bague: "", sexe: "male", couleur: "", date_naissance: "" })
            }
            disabled={fields.length >= 50}
          >
            <Plus className="size-4" /> Ajouter un jeune
          </Button>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false); form.reset(); }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="size-4" /> Générer {fields.length} juvénile
                  {fields.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReproductionDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const reproId = Number(id);
  const { data: r, isLoading, isError, refetch } = useGetReproductionQuery(reproId, {
    skip: isNaN(reproId),
  });
  const [deleteReproduction] = useDeleteReproductionMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [offspringOpen, setOffspringOpen] = useState(false);

  const isTerminee = r?.statut === "terminee";
  const isEchec = r?.statut === "echec";
  const hasOffspring = (r?.pigeons?.length ?? 0) > 0;
  const canEdit = !isTerminee;
  const canGenerateOffspring = !isEchec && !hasOffspring;

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
        <ErrorAlert
          message="Impossible de charger cette reproduction."
          onRetry={() => refetch()}
        />
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
          <EditReproductionDialog
            reproduction={r}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <GenerateOffspringDialog
            reproduction={r}
            open={offspringOpen}
            onOpenChange={setOffspringOpen}
          />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Supprimer cette reproduction ?"
            description="La suppression est définitive. Une reproduction avec des juvéniles enregistrés ne peut pas être supprimée."
            confirmLabel="Supprimer"
            variant="destructive"
            onConfirm={async () => {
              try {
                await deleteReproduction(r.id).unwrap();
                toast.success(`Reproduction #${r.id} supprimée.`);
                void navigate({ to: "/reproductions" });
              } catch (err) {
                const msg =
                  (err as { data?: { message?: string } })?.data?.message ??
                  "Cette reproduction ne peut pas être supprimée.";
                toast.error(msg);
                setDeleteOpen(false);
              }
            }}
          />

          {(() => {
            const maleBague = r.couple?.male?.code_bague;
            const femelleBague = r.couple?.femelle?.code_bague;
            const maleId = r.couple?.male?.id;
            const femelleId = r.couple?.femelle?.id;
            const jeunes = r.nombre_jeunes ?? 0;
            const pigeons = r.pigeons ?? [];

            return (
              <>
                <PageHeader
                  title={`Reproduction #${r.id}`}
                  subtitle={`Couple #${r.couple_id}`}
                  actions={
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={STATUT_TONES[r.statut]}>{STATUT_LABELS[r.statut]}</Badge>
                      {canGenerateOffspring && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setOffspringOpen(true)}
                        >
                          <Sparkles className="size-4" /> Générer les juvéniles
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setEditOpen(true)}
                        >
                          <Pencil className="size-4" /> Modifier
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  }
                />

                {isTerminee && (
                  <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Cette reproduction est <strong>terminée</strong> et ne peut plus être modifiée.
                  </div>
                )}
                {isEchec && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                    Cette reproduction est en <strong>échec</strong> — seules les notes sont encore
                    modifiables.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold mb-3">Parents</h3>
                    <div className="space-y-2">
                      {maleId ? (
                        <Link
                          to="/pigeons/$ring"
                          params={{ ring: String(maleId) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                        >
                          <Bird className="size-4" />
                          <span className="font-mono text-sm">{maleBague}</span>
                          <span className="ml-auto text-[10px] font-semibold uppercase">Mâle</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-blue-500/10 text-blue-600">
                          <Bird className="size-4" />
                          <span className="font-mono text-sm text-muted-foreground">—</span>
                          <span className="ml-auto text-[10px] font-semibold uppercase">Mâle</span>
                        </div>
                      )}
                      {femelleId ? (
                        <Link
                          to="/pigeons/$ring"
                          params={{ ring: String(femelleId) }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-colors"
                        >
                          <Bird className="size-4" />
                          <span className="font-mono text-sm">{femelleBague}</span>
                          <span className="ml-auto text-[10px] font-semibold uppercase">
                            Femelle
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-pink-500/10 text-pink-600">
                          <Bird className="size-4" />
                          <span className="font-mono text-sm text-muted-foreground">—</span>
                          <span className="ml-auto text-[10px] font-semibold uppercase">
                            Femelle
                          </span>
                        </div>
                      )}
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm border-t pt-4">
                      <div>
                        <dt className="text-muted-foreground text-xs">Couple</dt>
                        <dd>
                          <Link
                            to="/couples/$id"
                            params={{ id: String(r.couple_id) }}
                            className="font-mono text-primary hover:underline"
                          >
                            #{r.couple_id}
                          </Link>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs">Ponte</dt>
                        <dd className="font-medium">{r.date_ponte}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs">Éclosion</dt>
                        <dd className="font-medium">{r.date_eclosion ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs">Jeunes déclarés</dt>
                        <dd className="font-medium">{jeunes}</dd>
                      </div>
                      {r.notes && (
                        <div className="col-span-2">
                          <dt className="text-muted-foreground text-xs">Notes</dt>
                          <dd className="font-medium text-sm whitespace-pre-wrap">{r.notes}</dd>
                        </div>
                      )}
                    </dl>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Egg className="size-4" /> Juvéniles enregistrés
                      {pigeons.length > 0 && (
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {pigeons.length} au total
                        </span>
                      )}
                    </h3>
                    {pigeons.length === 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Aucun juvénile enregistré.
                        </p>
                        {canGenerateOffspring && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => setOffspringOpen(true)}
                          >
                            <Sparkles className="size-4" /> Générer les juvéniles
                          </Button>
                        )}
                        {isEchec && (
                          <p className="text-xs text-muted-foreground">
                            Les juvéniles ne peuvent pas être générés pour une reproduction en
                            échec.
                          </p>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {pigeons.map((p) => (
                          <li key={p.id}>
                            <Link
                              to="/pigeons/$ring"
                              params={{ ring: String(p.id) }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cage-empty-soft border border-cage-empty-border hover:bg-cage-empty-soft/80 transition-colors"
                            >
                              <Bird className="size-4 text-cage-empty" />
                              <span className="font-mono text-sm">{p.code_bague}</span>
                              <span className="ml-auto text-xs text-muted-foreground capitalize">
                                {p.sexe === "male" ? "Mâle" : "Femelle"}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </>
            );
          })()}
        </>
      )}
    </AppShell>
  );
}
