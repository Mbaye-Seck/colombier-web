import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Button } from "@/components/domain";
import { InputField } from "@/components/ui/form-field";
import { useAuth } from "@/providers/auth-provider";
import { profilSchema, type ProfilValues } from "@/lib/schemas/profil";
import { Bird, Mail, MapPin, Calendar, ShieldCheck, Loader2 } from "lucide-react";

const MOCK_STATS = { pigeons: 142, couples: 24, reproductions: 87, since: "Janvier 2021" };

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  );
}

export function ProfilPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState("Lyon, France");

  const initials = user?.nom_complet
    ? user.nom_complet.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const form = useForm<ProfilValues>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      name: user?.nom_complet ?? "",
      email: user?.email ?? "",
      location,
    },
  });

  function onSubmit(values: ProfilValues) {
    setLocation(values.location ?? location);
    setEditing(false);
    toast.success("Profil mis à jour (démonstration).");
  }

  return (
    <AppShell>
      <PageHeader
        title="Profil éleveur"
        subtitle="Vos informations personnelles et statistiques d'élevage."
        actions={
          !editing ? (
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              Modifier
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-2xl space-y-6">
        {/* Avatar + stats */}
        <Card>
          <div className="flex items-start gap-5 flex-wrap">
            <div className="size-20 rounded-2xl bg-linear-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center text-2xl font-bold shadow-md shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold">{user?.nom_complet ?? "—"}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role ?? ""}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {user?.email ?? "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {form.watch("location") || location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Éleveur depuis {MOCK_STATS.since}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
            {[
              { label: "Pigeons", value: MOCK_STATS.pigeons },
              { label: "Couples actifs", value: MOCK_STATS.couples },
              { label: "Reproductions", value: MOCK_STATS.reproductions },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Edit form */}
        {editing ? (
          <Card>
            <h3 className="text-sm font-semibold mb-4">Modifier le profil</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
              <InputField
                id="p-name"
                label="Nom complet"
                error={form.formState.errors.name?.message}
                {...form.register("name")}
              />
              <InputField
                id="p-email"
                label="Email"
                type="email"
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <InputField
                id="p-location"
                label="Localisation"
                placeholder="ex : Lyon, France"
                error={form.formState.errors.location?.message}
                {...form.register("location")}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditing(false); form.reset(); }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <h3 className="text-sm font-semibold mb-4">Informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow label="Nom complet" value={user?.nom_complet ?? "—"} />
              <FieldRow label="Email" value={user?.email ?? "—"} />
              <FieldRow label="Localisation" value={form.watch("location") || location} />
              <FieldRow label="Membre depuis" value={MOCK_STATS.since} />
            </div>
          </Card>
        )}

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">Sécurité</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            La gestion du mot de passe et l'authentification à deux facteurs seront disponibles
            après connexion au backend Laravel.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.message("Changement de mot de passe — à connecter au backend.")}
          >
            Changer le mot de passe
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
