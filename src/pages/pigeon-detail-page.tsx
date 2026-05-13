import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Bird, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card, Button } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { InputField, SelectField } from "@/components/ui/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetPigeonQuery,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} from "@/store/api/pigeonApi";
import { pigeonFormSchema, type PigeonFormValues } from "@/lib/schemas/pigeon";
import { cn } from "@/lib/utils";
import type { PigeonStatut } from "@/types/pigeon";

const STATUT_LABELS: Record<PigeonStatut, string> = {
  actif: "Actif",
  vendu: "Vendu",
  mort: "Mort",
  perdu: "Perdu",
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

export function PigeonDetailPage({ ring }: { ring: string }) {
  const navigate = useNavigate();
  const pigeonId = Number(ring);

  const { data: pigeon, isLoading, isError, refetch } = useGetPigeonQuery(pigeonId, {
    skip: isNaN(pigeonId),
  });
  const [updatePigeon] = useUpdatePigeonMutation();
  const [deletePigeon] = useDeletePigeonMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<PigeonFormValues>({
    resolver: zodResolver(pigeonFormSchema),
  });

  // Pre-fill form whenever the edit dialog opens
  useEffect(() => {
    if (pigeon && editOpen) {
      form.reset({
        code_bague: pigeon.code_bague,
        sexe: pigeon.sexe,
        race: pigeon.race ?? "",
        couleur: pigeon.couleur ?? "",
        date_naissance: pigeon.date_naissance ?? "",
      });
    }
  }, [pigeon, editOpen, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!pigeon) return;
    const payload = {
      code_bague: values.code_bague.trim(),
      sexe: values.sexe,
      race: values.race?.trim() || null,
      couleur: values.couleur?.trim() || null,
      date_naissance: values.date_naissance || null,
    };
    try {
      const updated = await updatePigeon({ id: pigeon.id, data: payload }).unwrap();
      toast.success(`Pigeon ${updated.code_bague} mis à jour.`);
      setEditOpen(false);
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) {
        form.setError("root", { message: "Une erreur est survenue. Réessayez." });
      }
    }
  });

  async function handleDelete() {
    if (!pigeon) return;
    try {
      await deletePigeon(pigeon.id).unwrap();
      toast.success("Pigeon supprimé.");
      void navigate({ to: "/pigeons" });
    } catch {
      toast.error("Impossible de supprimer ce pigeon.");
    }
  }

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/pigeons"
          className={cn(
            "inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted",
          )}
        >
          <ArrowLeft className="size-4" /> Pigeons
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement du pigeon…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger ce pigeon." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !pigeon && (
        <>
          <PageHeader
            title="Pigeon introuvable"
            subtitle={`Aucun pigeon avec l'identifiant « ${ring} ».`}
          />
          <Card>
            <Link
              to="/pigeons"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour à la liste
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && pigeon && (
        <>
          {/* ── Edit dialog ── */}
          <Dialog
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) form.reset();
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Modifier le pigeon</DialogTitle>
                <DialogDescription>
                  Mettez à jour les informations de ce pigeon.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                {form.formState.errors.root && (
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <InputField
                  id="detail-code-bague"
                  label="Matricule (code bague)"
                  placeholder="ex : SN-2024-001"
                  error={form.formState.errors.code_bague?.message}
                  {...form.register("code_bague")}
                />
                <SelectField
                  id="detail-sexe"
                  label="Sexe"
                  error={form.formState.errors.sexe?.message}
                  {...form.register("sexe")}
                >
                  <option value="male">Mâle</option>
                  <option value="femelle">Femelle</option>
                </SelectField>
                <InputField
                  id="detail-race"
                  label="Race (optionnel)"
                  placeholder="ex : Voyageur"
                  error={form.formState.errors.race?.message}
                  {...form.register("race")}
                />
                <InputField
                  id="detail-couleur"
                  label="Couleur (optionnel)"
                  placeholder="ex : Bleu barré"
                  error={form.formState.errors.couleur?.message}
                  {...form.register("couleur")}
                />
                <InputField
                  id="detail-date"
                  label="Date de naissance (optionnel)"
                  type="date"
                  error={form.formState.errors.date_naissance?.message}
                  {...form.register("date_naissance")}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(false)}
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

          {/* ── Delete confirm ── */}
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Supprimer ce pigeon ?"
            description={`Le pigeon « ${pigeon.code_bague} » sera définitivement supprimé. Cette action est irréversible.`}
            confirmLabel="Supprimer"
            onConfirm={handleDelete}
          />

          <PageHeader
            title={pigeon.code_bague}
            subtitle={[pigeon.race, pigeon.couleur].filter(Boolean).join(" · ") || "—"}
            actions={
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" /> Modifier
                </Button>
                <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" /> Supprimer
                </Button>
              </div>
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold mb-3">Identité</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sexe</dt>
                  <dd>
                    <Badge tone={pigeon.sexe === "male" ? "default" : "couple"}>
                      {pigeon.sexe === "male" ? "Mâle" : "Femelle"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Race</dt>
                  <dd>{pigeon.race ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Couleur</dt>
                  <dd>{pigeon.couleur ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date de naissance</dt>
                  <dd>{pigeon.date_naissance ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Statut</dt>
                  <dd>
                    <Badge
                      tone={
                        pigeon.statut === "actif"
                          ? "empty"
                          : pigeon.statut === "vendu"
                            ? "muted"
                            : "single"
                      }
                    >
                      {STATUT_LABELS[pigeon.statut]}
                    </Badge>
                  </dd>
                </div>
                {pigeon.pere && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Père</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(pigeon.pere.id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        {pigeon.pere.code_bague}
                      </Link>
                    </dd>
                  </div>
                )}
                {pigeon.mere && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Mère</dt>
                    <dd>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(pigeon.mere.id) }}
                        className="font-mono text-primary hover:underline"
                      >
                        {pigeon.mere.code_bague}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
            <Card className="flex flex-col items-center justify-center min-h-50 text-muted-foreground">
              <Bird className="size-12 opacity-30 mb-2" />
              <p className="text-sm text-center">
                Historique et documents disponibles prochainement.
              </p>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
