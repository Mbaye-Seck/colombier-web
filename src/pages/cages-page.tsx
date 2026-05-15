import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Button } from "@/components/domain";
import { CageGrid } from "@/features/cages";
import { InputField } from "@/components/ui/form-field";
import { useCreateCageMutation } from "@/store/api/cageApi";
import { cageCreateSchema, type CageCreateValues, CAGE_TYPE } from "@/lib/schemas/cage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function CreateCageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [createCage] = useCreateCageMutation();

  const form = useForm<CageCreateValues>({
    resolver: zodResolver(cageCreateSchema),
    defaultValues: {
      numero: "",
      nom: "",
      type: "individuelle",
      capacite: undefined,
      superficie: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      capacite: values.capacite ?? null,
      superficie: values.superficie ?? null,
    };
    try {
      const cage = await createCage(payload).unwrap();
      toast.success(`Cage ${cage.code} créée.`);
      onOpenChange(false);
      form.reset();
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
          <DialogTitle>Nouvelle cage</DialogTitle>
          <DialogDescription>Créez une nouvelle cage dans la volière.</DialogDescription>
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
            id="c-numero"
            label="Numéro"
            placeholder="ex : A01"
            error={form.formState.errors.numero?.message}
            {...form.register("numero")}
          />
          <InputField
            id="c-nom"
            label="Nom"
            placeholder="ex : Cage A01"
            error={form.formState.errors.nom?.message}
            {...form.register("nom")}
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="c-type">
              Type
            </label>
            <select
              id="c-type"
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
            id="c-capacite"
            label="Capacité (optionnel)"
            type="number"
            placeholder="ex : 2"
            error={form.formState.errors.capacite?.message}
            {...form.register("capacite", { valueAsNumber: true })}
          />
          <InputField
            id="c-superficie"
            label="Superficie m² (optionnel)"
            type="number"
            placeholder="ex : 1.5"
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
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CagesPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Volières & Cages"
        subtitle="Visualisez et gérez l'occupation de chaque cage en un coup d'œil."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Nouvelle cage
          </Button>
        }
      />
      <CreateCageDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CageGrid />
    </AppShell>
  );
}
