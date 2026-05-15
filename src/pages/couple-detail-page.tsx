import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Bird, Heart, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Card, Button } from "@/components/domain";
import { LoadingSpinner, ErrorAlert } from "@/components/ui/query-states";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputField } from "@/components/ui/form-field";
import {
  useGetCoupleQuery,
  useUpdateCoupleMutation,
  useDeleteCoupleMutation,
} from "@/store/api/coupleApi";
import { coupleUpdateSchema, type CoupleUpdateValues } from "@/lib/schemas/couple";
import type { Couple } from "@/types/couple";

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

function EditCoupleDialog({
  couple,
  open,
  onOpenChange,
}: {
  couple: Couple;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateCouple] = useUpdateCoupleMutation();

  const form = useForm<CoupleUpdateValues>({
    resolver: zodResolver(coupleUpdateSchema),
    defaultValues: {
      statut: couple.statut,
      date_formation: couple.date_formation,
      date_rupture: couple.date_rupture ?? "",
    },
  });

  const watchStatut = form.watch("statut");

  useEffect(() => {
    if (open) {
      form.reset({
        statut: couple.statut,
        date_formation: couple.date_formation,
        date_rupture: couple.date_rupture ?? "",
      });
    }
  }, [open, couple, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: CoupleUpdateValues = {
      statut: values.statut,
      date_formation: values.date_formation || undefined,
      date_rupture: values.date_rupture || null,
    };
    try {
      await updateCouple({ id: couple.id, data: payload }).unwrap();
      toast.success("Couple mis à jour.");
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
          <DialogTitle>Modifier le couple #{couple.id}</DialogTitle>
          <DialogDescription>
            Les membres du couple (mâle et femelle) ne peuvent pas être modifiés.
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
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="edit-statut">
              Statut
            </label>
            <select
              id="edit-statut"
              className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm"
              {...form.register("statut")}
            >
              <option value="actif">Actif</option>
              <option value="rompu">Rompu</option>
            </select>
            {form.formState.errors.statut && (
              <p className="text-xs text-destructive mt-1" role="alert">
                {form.formState.errors.statut.message}
              </p>
            )}
          </div>
          <InputField
            id="edit-date-formation"
            label="Date de formation"
            type="date"
            error={form.formState.errors.date_formation?.message}
            {...form.register("date_formation")}
          />
          <InputField
            id="edit-date-rupture"
            label={watchStatut === "rompu" ? "Date de rupture *" : "Date de rupture"}
            type="date"
            error={form.formState.errors.date_rupture?.message}
            {...form.register("date_rupture")}
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

export function CoupleDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const coupleId = Number(id);
  const { data: couple, isLoading, isError, refetch } = useGetCoupleQuery(coupleId, {
    skip: isNaN(coupleId),
  });
  const [deleteCouple] = useDeleteCoupleMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          to="/couples"
          className="inline-flex items-center gap-1.5 -ml-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="size-4" /> Couples
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Chargement du couple…" />}
      {isError && (
        <ErrorAlert message="Impossible de charger ce couple." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && !couple && (
        <>
          <PageHeader title="Couple introuvable" subtitle={`Référence « ${id} » inconnue.`} />
          <Card>
            <Link
              to="/couples"
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retour aux couples
            </Link>
          </Card>
        </>
      )}

      {!isLoading && !isError && couple && (
        <>
          <EditCoupleDialog couple={couple} open={editOpen} onOpenChange={setEditOpen} />

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Supprimer ce couple ?"
            description="La suppression est définitive. Un couple ayant des reproductions ou des affectations en cage ne peut pas être supprimé."
            confirmLabel="Supprimer"
            variant="destructive"
            onConfirm={async () => {
              try {
                await deleteCouple(couple.id).unwrap();
                toast.success(`Couple #${couple.id} supprimé.`);
                void navigate({ to: "/couples" });
              } catch (err) {
                const msg =
                  (err as { data?: { message?: string } })?.data?.message ??
                  "Ce couple ne peut pas être supprimé.";
                toast.error(msg);
                setDeleteOpen(false);
              }
            }}
          />

          {(() => {
            const maleBague = couple.male?.code_bague ?? `ID ${couple.male_id}`;
            const femelleBague = couple.femelle?.code_bague ?? `ID ${couple.femelle_id}`;
            const nbRepros = couple.reproductions?.length ?? 0;
            return (
              <>
                <PageHeader
                  title={`Couple #${couple.id}`}
                  subtitle={`Formé le ${couple.date_formation}`}
                  actions={
                    <div className="flex items-center gap-2">
                      <Badge tone={couple.statut === "actif" ? "empty" : "muted"}>
                        {couple.statut === "actif" ? "Actif" : "Rompu"}
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
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold mb-3">Membres</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border p-3 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Bird className="size-4 text-blue-600" />
                          <span className="text-[11px] font-semibold text-blue-600 uppercase">
                            Mâle
                          </span>
                        </div>
                        <Link
                          to="/pigeons/$ring"
                          params={{ ring: String(couple.male_id) }}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {maleBague}
                        </Link>
                      </div>
                      <Heart className="size-5 text-cage-couple shrink-0" fill="currentColor" />
                      <div className="flex-1 rounded-xl border p-3 bg-pink-500/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Bird className="size-4 text-pink-600" />
                          <span className="text-[11px] font-semibold text-pink-600 uppercase">
                            Femelle
                          </span>
                        </div>
                        <Link
                          to="/pigeons/$ring"
                          params={{ ring: String(couple.femelle_id) }}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {femelleBague}
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Formé le</div>
                        <div className="font-medium">{couple.date_formation}</div>
                      </div>
                      {couple.date_rupture && (
                        <div>
                          <div className="text-muted-foreground text-xs">Rompu le</div>
                          <div className="font-medium">{couple.date_rupture}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold mb-3">Reproductions enregistrées</h3>
                    <p className="text-3xl font-semibold">{nbRepros}</p>
                    {nbRepros > 0 && (
                      <ul className="mt-3 space-y-1 text-sm">
                        {couple.reproductions!.map((r) => (
                          <li key={r.id}>
                            <Link
                              to="/reproductions/$id"
                              params={{ id: String(r.id) }}
                              className="text-primary hover:underline font-mono"
                            >
                              #{r.id} — {r.date_ponte}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {nbRepros === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Aucune reproduction enregistrée.
                      </p>
                    )}
                    {nbRepros === 0 && couple.statut === "actif" && (
                      <div className="mt-3">
                        <Link
                          to="/reproductions"
                          className="text-xs text-primary hover:underline"
                        >
                          Enregistrer une reproduction →
                        </Link>
                      </div>
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
