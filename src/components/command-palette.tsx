/**
 * Palette de commandes globale — activée avec ⌘K / Ctrl+K.
 * Permet une navigation rapide et le lancement d'actions clés.
 */
export { useCommandPalette } from "@/hooks/use-command-palette";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Bird,
  Heart,
  Egg,
  Grid3x3,
  LogOut,
  Bell,
  Settings,
  User,
  Plus,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_COMMANDS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Pigeons", icon: Bird, to: "/pigeons" },
  { label: "Couples", icon: Heart, to: "/couples" },
  { label: "Reproductions", icon: Egg, to: "/reproductions" },
  { label: "Volières & Cages", icon: Grid3x3, to: "/cages" },
  { label: "Sorties", icon: LogOut, to: "/exits" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Paramètres", icon: Settings, to: "/parametres" },
  { label: "Mon profil", icon: User, to: "/profil" },
] as const;

const ACTION_COMMANDS = [
  { label: "Ajouter un pigeon", icon: Plus, to: "/pigeons", hash: "nouveau" },
  { label: "Nouveau couple", icon: Plus, to: "/couples", hash: "nouveau" },
  { label: "Nouvelle reproduction", icon: Plus, to: "/reproductions", hash: "nouveau" },
  { label: "Nouvelle sortie", icon: Plus, to: "/exits", hash: "nouveau" },
] as const;

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  function run(to: string, hash?: string) {
    onOpenChange(false);
    void navigate({ to: to as "/", hash });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher une page ou une action…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {NAV_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.to} onSelect={() => run(cmd.to)}>
                <Icon className="mr-2 size-4" />
                {cmd.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions rapides">
          {ACTION_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => run(cmd.to, cmd.hash)}>
                <Icon className="mr-2 size-4" />
                {cmd.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
