import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Button, Card } from "@/components/domain";
import {
  useGetPigeonPageQuery,
  useGetPigeonsQuery,
  useCreatePigeonMutation,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} from "@/store/api/pigeonApi";
import type { PigeonListParams } from "@/store/api/pigeonApi";
import { pigeonFormSchema, type PigeonFormValues } from "@/lib/schemas/pigeon";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Bird, Loader2, ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import type { Pigeon, PigeonStatut, PigeonSexe } from "@/types/pigeon";

// Transforms form values (strings from HTML inputs) into a backend-compatible payload.
// Empty strings become null for nullable fields.
function toPayload(v: PigeonFormValues) {
  return {
    code_bague: v.code_bague.trim(),
    sexe: v.sexe,
    race: v.race?.trim() || null,
    couleur: v.couleur?.trim() || null,
    date_naissance: v.date_naissance || null,
    pere_id: v.pere_id ?? null,
    mere_id: v.mere_id ?? null,
  };
}

type Payload = ReturnType<typeof toPayload>;

// Builds a FormData when a photo file is present.
// For updates, appends _method=PATCH for Laravel method spoofing (PHP ignores files on PATCH/PUT).
function toFormData(payload: Payload, photoFile: File, method?: "PATCH"): FormData {
  const fd = new FormData();
  if (method) fd.append("_method", method);
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

// Reads 422 field-level errors from RTK Query's FetchBaseQueryError and applies
// them to a react-hook-form instance. Returns true if errors were found.
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

const STATUT_LABELS: Record<PigeonStatut, string> = {
  actif: "Actif",
  vendu: "Vendu",
  mort: "Mort",
  perdu: "Perdu",
};

const FORM_DEFAULTS: PigeonFormValues = {
  code_bague: "",
  sexe: "male",
  race: "",
  couleur: "",
  date_naissance: "",
  pere_id: null,
  mere_id: null,
};

type SexFilter = "all" | PigeonSexe;
type StatusFilter = "all" | PigeonStatut;

export function PigeonsPage() {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState<SexFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editingPigeon, setEditingPigeon] = useState<Pigeon | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Photo file state ────────────────────────────────────────────────────────
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [addPhotoPreview, setAddPhotoPreview] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

  function handleAddPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (addPhotoPreview) URL.revokeObjectURL(addPhotoPreview);
    setAddPhotoFile(file);
    setAddPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleEditPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoFile(file);
    setEditPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearAddPhoto() {
    if (addPhotoPreview) URL.revokeObjectURL(addPhotoPreview);
    setAddPhotoFile(null);
    setAddPhotoPreview(null);
  }

  function clearEditPhoto() {
    if (editPhotoPreview) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
  }

  // Debounce the search input (350ms) before sending to the server
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [sexFilter, statusFilter, search]);

  // Support opening the add dialog via URL hash #nouveau
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#nouveau") {
      setAddOpen(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // Build server-side query params from current filter/page state
  const queryParams = useMemo<PigeonListParams>(() => {
    const params: PigeonListParams = { page, per_page: 15 };
    if (sexFilter !== "all") params["filter[sexe]"] = sexFilter;
    if (statusFilter !== "all") params["filter[statut]"] = statusFilter;
    if (search) params["filter[search]"] = search;
    return params;
  }, [page, sexFilter, statusFilter, search]);

  // ── RTK Query ───────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useGetPigeonPageQuery(queryParams);
  const { data: allPigeons = [] } = useGetPigeonsQuery({ per_page: 200, "filter[statut]": "actif" });
  const [createPigeon] = useCreatePigeonMutation();
  const [updatePigeon] = useUpdatePigeonMutation();
  const [deletePigeon] = useDeletePigeonMutation();

  const maleOptions = useMemo(() => allPigeons.filter((p) => p.sexe === "male"), [allPigeons]);
  const femaleOptions = useMemo(() => allPigeons.filter((p) => p.sexe === "femelle"), [allPigeons]);

  const pigeons = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.last_page ?? 1;
  const currentPage = meta?.current_page ?? 1;

  // ── Forms ───────────────────────────────────────────────────────────────────
  const addForm = useForm<PigeonFormValues>({
    resolver: zodResolver(pigeonFormSchema),
    defaultValues: FORM_DEFAULTS,
  });

  const editForm = useForm<PigeonFormValues>({
    resolver: zodResolver(pigeonFormSchema),
  });

  // Pre-fill the edit form whenever a different pigeon is selected for editing
  useEffect(() => {
    if (editingPigeon) {
      editForm.reset({
        code_bague: editingPigeon.code_bague,
        sexe: editingPigeon.sexe,
        race: editingPigeon.race ?? "",
        couleur: editingPigeon.couleur ?? "",
        date_naissance: editingPigeon.date_naissance ?? "",
        pere_id: editingPigeon.pere_id ?? null,
        mere_id: editingPigeon.mere_id ?? null,
      });
    }
  }, [editingPigeon, editForm]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onAddSubmit = addForm.handleSubmit(async (values) => {
    try {
      const payload = toPayload(values);
      const body = addPhotoFile ? toFormData(payload, addPhotoFile) : payload;
      const pigeon = await createPigeon(body).unwrap();
      toast.success(`Pigeon ${pigeon.code_bague} enregistré.`);
      setAddOpen(false);
      addForm.reset(FORM_DEFAULTS);
      clearAddPhoto();
    } catch (err) {
      if (!applyApiErrors(err, addForm.setError)) {
        addForm.setError("root", { message: "Une erreur est survenue. Réessayez." });
      }
    }
  });

  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editingPigeon) return;
    try {
      const payload = toPayload(values);
      const data = editPhotoFile ? toFormData(payload, editPhotoFile, "PATCH") : payload;
      const pigeon = await updatePigeon({ id: editingPigeon.id, data }).unwrap();
      toast.success(`Pigeon ${pigeon.code_bague} mis à jour.`);
      setEditingPigeon(null);
      clearEditPhoto();
    } catch (err) {
      if (!applyApiErrors(err, editForm.setError)) {
        editForm.setError("root", { message: "Une erreur est survenue. Réessayez." });
      }
    }
  });

  async function handleDelete() {
    if (deletingId === null) return;
    try {
      await deletePigeon(deletingId).unwrap();
      toast.success("Pigeon supprimé.");
    } catch {
      toast.error("Impossible de supprimer ce pigeon.");
    }
  }

  const hasFilters = !!search || sexFilter !== "all" || statusFilter !== "all";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <PageHeader
        title="Pigeons"
        subtitle={
          isLoading
            ? "Chargement…"
            : `${total} pigeon${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""} dans votre élevage.`
        }
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Ajouter un pigeon
          </Button>
        }
      />

      {/* ── Add dialog ── */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) { addForm.reset(FORM_DEFAULTS); clearAddPhoto(); }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau pigeon</DialogTitle>
            <DialogDescription>
              Enregistrez un nouveau pigeon dans votre élevage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onAddSubmit} className="space-y-4">
            {addForm.formState.errors.root && (
              <p role="alert" className="text-xs text-destructive">
                {addForm.formState.errors.root.message}
              </p>
            )}
            <InputField
              id="add-code-bague"
              label="Matricule (code bague)"
              placeholder="ex : SN-2024-001"
              error={addForm.formState.errors.code_bague?.message}
              {...addForm.register("code_bague")}
            />
            <SelectField
              id="add-sexe"
              label="Sexe"
              error={addForm.formState.errors.sexe?.message}
              {...addForm.register("sexe")}
            >
              <option value="male">Mâle</option>
              <option value="femelle">Femelle</option>
            </SelectField>
            <InputField
              id="add-race"
              label="Race (optionnel)"
              placeholder="ex : Voyageur"
              error={addForm.formState.errors.race?.message}
              {...addForm.register("race")}
            />
            <InputField
              id="add-couleur"
              label="Couleur (optionnel)"
              placeholder="ex : Bleu barré"
              error={addForm.formState.errors.couleur?.message}
              {...addForm.register("couleur")}
            />
            <InputField
              id="add-date"
              label="Date de naissance (optionnel)"
              type="date"
              error={addForm.formState.errors.date_naissance?.message}
              {...addForm.register("date_naissance")}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="add-pere">
                Père (optionnel)
              </label>
              <select
                id="add-pere"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...addForm.register("pere_id", {
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
              {addForm.formState.errors.pere_id && (
                <p className="text-xs text-destructive mt-1">{addForm.formState.errors.pere_id.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="add-mere">
                Mère (optionnel)
              </label>
              <select
                id="add-mere"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...addForm.register("mere_id", {
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
              {addForm.formState.errors.mere_id && (
                <p className="text-xs text-destructive mt-1">{addForm.formState.errors.mere_id.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Photo (optionnel)</label>
              {addPhotoPreview ? (
                <div className="mt-1.5 relative w-fit">
                  <img
                    src={addPhotoPreview}
                    alt="Aperçu"
                    className="size-20 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={clearAddPhoto}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white grid place-items-center"
                    aria-label="Supprimer la photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="add-photo"
                  className="mt-1.5 flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <ImagePlus className="size-4" />
                  Choisir une image…
                  <input
                    id="add-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAddPhotoChange}
                  />
                </label>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  addForm.reset(FORM_DEFAULTS);
                  clearAddPhoto();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={addForm.formState.isSubmitting}>
                {addForm.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog
        open={!!editingPigeon}
        onOpenChange={(open) => {
          if (!open) { setEditingPigeon(null); clearEditPhoto(); }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le pigeon</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de ce pigeon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onEditSubmit} className="space-y-4">
            {editForm.formState.errors.root && (
              <p role="alert" className="text-xs text-destructive">
                {editForm.formState.errors.root.message}
              </p>
            )}
            <InputField
              id="edit-code-bague"
              label="Matricule (code bague)"
              placeholder="ex : SN-2024-001"
              error={editForm.formState.errors.code_bague?.message}
              {...editForm.register("code_bague")}
            />
            <SelectField
              id="edit-sexe"
              label="Sexe"
              error={editForm.formState.errors.sexe?.message}
              {...editForm.register("sexe")}
            >
              <option value="male">Mâle</option>
              <option value="femelle">Femelle</option>
            </SelectField>
            <InputField
              id="edit-race"
              label="Race (optionnel)"
              placeholder="ex : Voyageur"
              error={editForm.formState.errors.race?.message}
              {...editForm.register("race")}
            />
            <InputField
              id="edit-couleur"
              label="Couleur (optionnel)"
              placeholder="ex : Bleu barré"
              error={editForm.formState.errors.couleur?.message}
              {...editForm.register("couleur")}
            />
            <InputField
              id="edit-date"
              label="Date de naissance (optionnel)"
              type="date"
              error={editForm.formState.errors.date_naissance?.message}
              {...editForm.register("date_naissance")}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-pere">
                Père (optionnel)
              </label>
              <select
                id="edit-pere"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...editForm.register("pere_id", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              >
                <option value="">— Aucun père —</option>
                {maleOptions
                  .filter((p) => p.id !== editingPigeon?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                    </option>
                  ))}
              </select>
              {editForm.formState.errors.pere_id && (
                <p className="text-xs text-destructive mt-1">{editForm.formState.errors.pere_id.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-mere">
                Mère (optionnel)
              </label>
              <select
                id="edit-mere"
                className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
                {...editForm.register("mere_id", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              >
                <option value="">— Aucune mère —</option>
                {femaleOptions
                  .filter((p) => p.id !== editingPigeon?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code_bague}{p.race ? ` — ${p.race}` : ""}
                    </option>
                  ))}
              </select>
              {editForm.formState.errors.mere_id && (
                <p className="text-xs text-destructive mt-1">{editForm.formState.errors.mere_id.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Photo (optionnel)</label>
              {editPhotoPreview || editingPigeon?.photo_url ? (
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="relative w-fit">
                    <img
                      src={editPhotoPreview ?? editingPigeon?.photo_url ?? ""}
                      alt="Photo actuelle"
                      className="size-20 rounded-lg object-cover border"
                    />
                    {editPhotoPreview && (
                      <button
                        type="button"
                        onClick={clearEditPhoto}
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white grid place-items-center"
                        aria-label="Annuler le changement"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <label
                    htmlFor="edit-photo"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    <ImagePlus className="size-3.5" />
                    {editPhotoPreview ? "Choisir une autre…" : "Remplacer…"}
                    <input
                      id="edit-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleEditPhotoChange}
                    />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="edit-photo"
                  className="mt-1.5 flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <ImagePlus className="size-4" />
                  Choisir une image…
                  <input
                    id="edit-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleEditPhotoChange}
                  />
                </label>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setEditingPigeon(null); clearEditPhoto(); }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? (
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
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Supprimer ce pigeon ?"
        description="Cette action est irréversible. Le pigeon sera supprimé de votre élevage."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />

      <Card className="p-0! overflow-hidden">
        {/* ── Filters ── */}
        <div className="p-4 border-b flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 flex-1 min-w-50 max-w-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher matricule, race, couleur…"
              className="bg-transparent outline-none text-sm flex-1"
              aria-label="Rechercher un pigeon"
            />
          </div>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value as SexFilter)}
            className="h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
            aria-label="Filtrer par sexe"
          >
            <option value="all">Tous les sexes</option>
            <option value="male">Mâle</option>
            <option value="femelle">Femelle</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="vendu">Vendu</option>
            <option value="mort">Mort</option>
            <option value="perdu">Perdu</option>
          </select>
        </div>

        {/* ── States ── */}
        {isLoading && <LoadingSpinner label="Chargement des pigeons…" />}
        {isError && (
          <ErrorAlert
            message="Impossible de charger les pigeons."
            onRetry={() => refetch()}
          />
        )}
        {!isLoading && !isError && pigeons.length === 0 && (
          <EmptyState
            title={
              hasFilters
                ? "Aucun pigeon ne correspond à vos filtres."
                : "Aucun pigeon enregistré."
            }
            description={
              hasFilters
                ? "Modifiez vos critères de recherche."
                : "Ajoutez votre premier pigeon pour commencer."
            }
            action={
              !hasFilters ? (
                <Button type="button" onClick={() => setAddOpen(true)}>
                  Ajouter un pigeon
                </Button>
              ) : undefined
            }
          />
        )}

        {/* ── Table ── */}
        {!isLoading && !isError && pigeons.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3">Matricule</th>
                  <th className="text-left font-medium px-4 py-3">Sexe</th>
                  <th className="text-left font-medium px-4 py-3">Race</th>
                  <th className="text-left font-medium px-4 py-3">Couleur</th>
                  <th className="text-left font-medium px-4 py-3">Naissance</th>
                  <th className="text-left font-medium px-4 py-3">Statut</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {pigeons.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(p.id) }}
                        className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <div
                          className={`size-8 rounded-lg grid place-items-center overflow-hidden ${
                            p.sexe === "male"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-pink-500/10 text-pink-600"
                          }`}
                        >
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.code_bague} className="size-8 object-cover" />
                          ) : (
                            <Bird className="size-4" />
                          )}
                        </div>
                        <span className="font-mono font-medium text-foreground hover:text-primary">
                          {p.code_bague}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.sexe === "male" ? "default" : "couple"}>
                        {p.sexe === "male" ? "Mâle" : "Femelle"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{p.race ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.couleur ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.date_naissance ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          p.statut === "actif"
                            ? "empty"
                            : p.statut === "vendu"
                              ? "muted"
                              : "single"
                        }
                      >
                        {STATUT_LABELS[p.statut]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="size-8 grid place-items-center rounded-lg hover:bg-muted cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/pigeons/$ring" params={{ ring: String(p.id) }}>
                              Voir la fiche
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingPigeon(p)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingId(p.id)}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer / Pagination ── */}
        {!isLoading && !isError && total > 0 && (
          <div className="p-4 flex items-center justify-between border-t text-sm text-muted-foreground">
            <span>
              {total} pigeon{total !== 1 ? "s" : ""}
              {totalPages > 1 && ` · page ${currentPage} / ${totalPages}`}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    variant={n === currentPage ? "primary" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
