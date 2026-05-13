import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Button } from "@/components/domain";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { Moon, Sun, Bell, Globe, Trash2 } from "lucide-react";

export function ParametresPage() {
  const { resolved, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <AppShell>
      <PageHeader
        title="Paramètres"
        subtitle="Préférences de l'application."
      />

      <div className="max-w-xl space-y-6">
        {/* Apparence */}
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            {resolved === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            Apparence
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="theme-toggle">Mode sombre</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actuellement : <span className="font-medium">{resolved === "dark" ? "Sombre" : "Clair"}</span>
                  {" "}· préférence enregistrée localement.
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={resolved === "dark"}
                onCheckedChange={toggle}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Bell className="size-4" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="notif-email">Rapport hebdomadaire par email</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Envoyé chaque lundi à {user?.email ?? "votre adresse email"}.
                </p>
              </div>
              <Switch
                id="notif-email"
                defaultChecked
                onCheckedChange={(v) =>
                  toast.success(v ? "Rapport hebdomadaire activé." : "Rapport hebdomadaire désactivé.")
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="notif-events">Alertes d'élevage</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nouveau-nés, cages disponibles, rappels de soins.
                </p>
              </div>
              <Switch
                id="notif-events"
                defaultChecked
                onCheckedChange={(v) =>
                  toast.success(v ? "Alertes activées." : "Alertes désactivées.")
                }
              />
            </div>
          </div>
        </Card>

        {/* Langue */}
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Globe className="size-4" />
            Langue et région
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Langue de l'interface</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Français (FR)</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.message("Sélection de la langue — disponible après connexion au backend.")}
            >
              Changer
            </Button>
          </div>
        </Card>

        {/* Compte */}
        <Card>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            <span className="text-destructive">Zone de danger</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ces actions sont irréversibles. La suppression de compte et l'export des données
            seront gérés côté backend Laravel.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.message("Export de données — à connecter au backend.")}
            >
              Exporter mes données
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                toast.error("Suppression de compte — fonctionnalité protégée côté serveur.")
              }
            >
              Supprimer le compte
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
