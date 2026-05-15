import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Bird, History, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card, Button } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetCageQuery,
  useUpdateCageMutation,
  useDeleteCageMutation,
  useReleaseCageMutation,
  useGetAffectationsByCageQuery,
} from "@/store/api/cageApi";
import { CAGE_STATUS_LABELS } from "@/types/cage";
import type { CageView, AffectationCage } from "@/types/cage";
import { cageUpdateSchema, type CageUpdateValues, CAGE_TYPE } from "@/lib/schemas/cage";
import { cn } from "@/lib/utils";

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

const CAGE_TYPE_LABELS: Record<(typeof CAGE_TYPE)[number], string> = {
  individuelle: "Individuelle",
  couple: "Couple",
  quarantaine: "Quarantaine",
  reproduction: "Reproduction",
};

function EditCageDialog({
  cage,
  open,
  onOpenChange,
}: {
  cage: CageView;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateCage] = useUpdateCageMutation();

  const form = useForm<CageUpdateValues>({
    resolver: zodResolver(cageUpdateSchema),
    defaultValues: {
      numero: cage.code,
      nom: cage.nom,
      type: cage.type,
      capacite: cage.capacite,
      superficie: cage.superficie,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        numero: cage.code,
        nom: cage.nom,
        type: cage.type,
        capacite: cage.capacite,
        superficie: cage.superficie,
      });
    }
  }, [open, cage, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateCage({ id: cage.backendId, data: values }).unwrap();
      toast.success(`Cage ${cage.code} mise à jour.`);
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
          <DialogTitle>Modifier la cage {cage.code}</DialogTitle>
          <DialogDescription>Modifiez les informations de la cage.</DialogDescription>
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
          <InputField
            id="ec-numero"
            label="Numéro"
            error={form.formState.errors.numero?.message}
            {...form.register("numero")}
          />
          <InputField
            id="ec-nom"
            label="Nom"
            error={form.formState.errors.nom?.message}
            {...form.register("nom")}
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="ec-type">
              Type
            </label>
            <select
              id="ec-type"
              className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm cursor-pointer"
              {...form.register("type")}
            >
              {CAGE_TYPE.map((t) => (
                <option key={t} value={t}>
                  {CAGE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive mt-1" role="alert">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>
          <InputField
            id="ec-capacite"
            label="Capacité (optionnel)"
            type="number"
            error={form.formState.errors.capacite?.message}
            {...form.register("capacite", { valueAsNumber: true })}
          />
          <InputField
            id="ec-superficie"
            label="Superficie m² (optionnel)"
            type="number"
            error={form.formState.errors.superficie?.message}
            {...form.register("superficie", { valueAsNumber: true })}
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

function AffectationHistorySection({ cageId }: { cageId: number }) {
  const { data: affectations = [], isLoading } = useGetAffectationsByCageQuery(cageId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Chargement de l'historique…
      </div>
    );
  }

  if (affectations.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun historique disponible.</p>;
  }

  return (
    <ul className="space-y-2">
      {affectations.map((a) => (
        <AffectationRow key={a.id} affectation={a} />
      ))}
    </ul>
  );
}

function AffectationRow({ affectation: a }: { affectation: AffectationCage }) {
  const label = a.pigeon
    ? a.pigeon.code_bague
    : a.couple
      ? `Couple #${a.couple_id}`
      : a.pigeon_id
        ? `Pigeon #${a.pigeon_id}`
        : `Couple #${a.couple_id}`;

  return (
    <li className="flex items-start gap-3 text-sm py-2 border-b last:border-0">
      <History className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {a.date_affectation}
          {a.date_liberation ? ` → ${a.date_liberation}` : " → en cours"}
          {a.motif ? ` · ${a.motif}` : ""}
        </div>
      </div>
      <span
        className={cn(
          "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full",
          a.actif
            ? "bg-cage-empty-soft text-cage-empty"
            : "bg-muted text-muted-foreground",
        )}
      >
        {a.actif ? "Actif" : "Terminé"}
      </span>
    </li>
  );
}

export function CageDetailPage({ code }: { code: string }) {
  const navigate = useNavigate();
  const cageId = Number(decodeURIComponent(code));
  const { data: cage, isLoading, isError, refetch } = useGetCageQuery(cageId, {
    skip: isNaN(cageId),
  });
  const [deleteCage] = useDeleteCageMutation();
  const [releaseCage, { isLoading: isReleasing }] = useReleaseCageMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/cages"
          className="inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Volières &amp; cages
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement de la cage…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger cette cage." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !cage && (
        <>
          <PageHeader title="Cage introuvable" subtitle={`Identifiant « ${code} » inconnu.`} />
          <Card>
            <Link
              to="/cages"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour aux volières
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && cage && (
        <>
          <EditCageDialog cage={cage} open={editOpen} onOpenChange={setEditOpen} />

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Supprimer cette cage ?"
            description="La suppression est définitive. Une cage ayant un historique d'affectation ne peut pas être supprimée."
            confirmLabel="Supprimer"
            variant="destructive"
            onConfirm={async () => {
              try {
                await deleteCage(cage.backendId).unwrap();
                toast.success(`Cage ${cage.code} supprimée.`);
                void navigate({ to: "/cages" });
              } catch (err) {
                const msg =
                  (err as { data?: { message?: string } })?.data?.message ??
                  "Cette cage ne peut pas être supprimée.";
                toast.error(msg);
                setDeleteOpen(false);
              }
            }}
          />

          <ConfirmDialog
            open={releaseOpen}
            onOpenChange={setReleaseOpen}
            title="Libérer cette cage ?"
            description="Les pigeons occupants seront retirés. L'historique est conservé."
            confirmLabel="Libérer"
            onConfirm={async () => {
              if (!cage.affectationId) return;
              try {
                await releaseCage(cage.affectationId).unwrap();
                toast.success(`Cage ${cage.code} libérée.`);
                setReleaseOpen(false);
              } catch {
                toast.error("Impossible de libérer la cage.");
                setReleaseOpen(false);
              }
            }}
          />

          <PageHeader
            title={`Cage ${cage.code}`}
            subtitle={CAGE_STATUS_LABELS[cage.status]}
            actions={
              <div className="flex items-center gap-2">
                <Badge tone={cage.status}>
                  {cage.status === "empty" ? "Libre" : cage.status === "single" ? "1 pigeon" : "Couple"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" /> Modifier
                </Button>
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Occupation actuelle</h3>
                {cage.status !== "empty" && cage.affectationId != null && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setReleaseOpen(true)}
                    disabled={isReleasing}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    {isReleasing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="size-4" /> Libérer
                      </>
                    )}
                  </Button>
                )}
              </div>
              {cage.occupants.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cette cage est actuellement libre.</p>
              ) : (
                <ul className="space-y-3">
                  {cage.occupants.map((o) => (
                    <li key={o.ring}>
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(o.pigeonId) }}
                        className="flex gap-3 p-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "size-12 rounded-lg grid place-items-center shrink-0",
                            o.sex === "M"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-pink-500/10 text-pink-600",
                          )}
                        >
                          <Bird className="size-6" />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{o.sex === "M" ? "Mâle" : "Femelle"}</div>
                          <div className="text-muted-foreground font-mono text-xs">{o.ring}</div>
                          <div className="text-xs text-muted-foreground">{o.race}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="size-4" /> Historique des affectations
              </h3>
              <AffectationHistorySection cageId={cage.backendId} />
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
