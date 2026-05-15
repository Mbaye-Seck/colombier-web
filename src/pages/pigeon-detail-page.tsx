import { useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Bird, Pencil, Trash2, Loader2, ImagePlus, X } from "lucide-react";
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
  useGetPigeonsQuery,
  useGetAncestorsQuery,
  useGetChildrenQuery,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} from "@/store/api/pigeonApi";
import { pigeonFormSchema, type PigeonFormValues } from "@/lib/schemas/pigeon";
import { GenealogyTree, ChildrenList } from "@/features/genealogy/genealogy-tree";
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

type Payload = {
  code_bague: string;
  sexe: "male" | "femelle";
  race: string | null;
  couleur: string | null;
  date_naissance: string | null;
  pere_id: number | null;
  mere_id: number | null;
};

// Builds a FormData for photo upload (PATCH spoofed as POST for PHP file support).
function toFormData(payload: Payload, photoFile: File): FormData {
  const fd = new FormData();
  fd.append("_method", "PATCH");
  fd.append("code_bague", payload.code_bague);
  fd.append("sexe", payload.sexe);
  if (payload.race != null) fd.append("race", payload.race);
  if (payload.couleur != null) fd.append("couleur", payload.couleur);
  if (payload.date_naissance != null) fd.append("date_naissance", payload.date_naissance);
  if (payload.pere_id != null) fd.append("pere_id", String(payload.pere_id));
  if (payload.mere_id != null) fd.append("mere_id", String(payload.mere_id));
  fd.append("photo", photoFile);
  return fd;
}

export function PigeonDetailPage({ ring }: { ring: string }) {
  const navigate = useNavigate();
  const pigeonId = Number(ring);

  const { data: pigeon, isLoading, isError, refetch } = useGetPigeonQuery(pigeonId, {
    skip: isNaN(pigeonId),
  });
  const { data: ancestorTree } = useGetAncestorsQuery({ id: pigeonId }, { skip: isNaN(pigeonId) });
  const { data: children = [] } = useGetChildrenQuery(pigeonId, { skip: isNaN(pigeonId) });
  const { data: allPigeons = [] } = useGetPigeonsQuery({ per_page: 200, "filter[statut]": "actif" });
  const [updatePigeon] = useUpdatePigeonMutation();
  const [deletePigeon] = useDeletePigeonMutation();

  const maleOptions = allPigeons.filter((p) => p.sexe === "male" && p.id !== pigeonId);
  const femaleOptions = allPigeons.filter((p) => p.sexe === "femelle" && p.id !== pigeonId);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Photo state ──────────────────────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function closeEditDialog() {
    setEditOpen(false);
    form.reset();
    clearPhoto();
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
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
        pere_id: pigeon.pere_id ?? null,
        mere_id: pigeon.mere_id ?? null,
      });
    }
  }, [pigeon, editOpen, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!pigeon) return;
    const payload: Payload = {
      code_bague: values.code_bague.trim(),
      sexe: values.sexe,
      race: values.race?.trim() || null,
      couleur: values.couleur?.trim() || null,
      date_naissance: values.date_naissance || null,
      pere_id: values.pere_id ?? null,
      mere_id: values.mere_id ?? null,
    };
    const data = photoFile ? toFormData(payload, photoFile) : payload;
    try {
      const updated = await updatePigeon({ id: pigeon.id, data }).unwrap();
      toast.success(`Pigeon ${updated.code_bague} mis à jour.`);
      closeEditDialog();
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
          <Dialog open={editOpen} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="detail-pere">
                    Père (optionnel)
                  </label>
                  <select
                    id="detail-pere"
                    className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                    {...form.register("pere_id", {
                      setValueAs: (v) => (v === "" ? null : Number(v)),
                    })}
                  >
                    <option value="">— Aucun père —</option>
                    {maleOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.pere_id && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.pere_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="detail-mere">
                    Mère (optionnel)
                  </label>
                  <select
                    id="detail-mere"
                    className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                    {...form.register("mere_id", {
                      setValueAs: (v) => (v === "" ? null : Number(v)),
                    })}
                  >
                    <option value="">— Aucune mère —</option>
                    {femaleOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.mere_id && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.mere_id.message}</p>
                  )}
                </div>

                {/* ── Photo input ── */}
                <div>
                  <label className="text-sm font-medium">Photo (optionnel)</label>
                  {photoPreview || pigeon.photo_url ? (
                    <div className="mt-1.5 flex items-center gap-3">
                      <div className="relative w-fit">
                        <img
                          src={photoPreview ?? pigeon.photo_url ?? ""}
                          alt="Photo actuelle"
                          className="size-20 rounded-lg object-cover border"
                        />
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white grid place-items-center"
                            aria-label="Annuler le changement"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                      <label
                        htmlFor="detail-photo"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      >
                        <ImagePlus className="size-3.5" />
                        {photoPreview ? "Choisir une autre…" : "Remplacer…"}
                        <input
                          id="detail-photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="detail-photo"
                      className="mt-1.5 flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <ImagePlus className="size-4" />
                      Choisir une image…
                      <input
                        id="detail-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={closeEditDialog}>
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

          <div className="space-y-4">
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

            {/* ── Photo card ── */}
            <Card className="flex flex-col items-center justify-center min-h-50">
              {pigeon.photo_url ? (
                <img
                  src={pigeon.photo_url}
                  alt={pigeon.code_bague}
                  className="max-h-52 rounded-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Bird className="size-12 opacity-30 mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-center">
                    Pas de photo.{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setEditOpen(true)}
                    >
                      Ajouter via Modifier.
                    </button>
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Genealogy tree ── */}
          <Card>
            <h3 className="text-sm font-semibold mb-4">Arbre généalogique</h3>
            {ancestorTree ? (
              <GenealogyTree tree={ancestorTree} />
            ) : (
              <p className="text-sm text-muted-foreground py-4">Chargement…</p>
            )}
          </Card>

          {/* ── Children / descendants ── */}
          <Card className="p-0! overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">
                Descendants
                {children.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {children.length} pigeon{children.length > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
            </div>
            <ChildrenList children={children} />
          </Card>

          </div>
        </>
      )}
    </AppShell>
  );
}
