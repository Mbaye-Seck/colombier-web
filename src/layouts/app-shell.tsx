import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bird,
  Heart,
  Egg,
  Grid3x3,
  LogOut,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  Settings,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";

type NavItem = { to: string; label: string; icon: typeof Bird; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/pigeons", label: "Pigeons", icon: Bird },
  { to: "/couples", label: "Couples", icon: Heart },
  { to: "/reproductions", label: "Reproductions", icon: Egg },
  { to: "/cages", label: "Volières & Cages", icon: Grid3x3 },
  { to: "/exits", label: "Sorties", icon: LogOut },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to as "/"}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { resolved, toggle } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const hasUnread = notifications.some((n) => n.unread);

  function handleLogout() {
    logout();
    router.invalidate();
    toast.success("Vous avez été déconnecté.");
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      {/* Skip navigation link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      <div className="flex">
        <aside
          aria-label="Navigation principale"
          className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0"
        >
          <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-sm">
              <Bird className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Colombier</div>
              <div className="text-[11px] text-muted-foreground">Gestion d’élevage</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Gestion
            </div>
            <NavLinks pathname={pathname} />
            <div className="pt-4 mt-2 border-t border-sidebar-border space-y-0.5">
              <Link
                to="/parametres"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/parametres")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
                )}
              >
                <Settings className="size-4" />
                Paramètres
              </Link>
              <Link
                to="/notifications"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/notifications")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
                )}
              >
                <Bell className="size-4" />
                Notifications
              </Link>
            </div>
          </nav>

          <div className="p-3 border-t border-sidebar-border space-y-1">
            <Link
              to="/profil"
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <div className="size-8 rounded-full bg-linear-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                {user
                  ? user.nom_complet
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{user?.nom_complet ?? "—"}</div>
                <div className="text-[11px] text-muted-foreground truncate capitalize">
                  {user?.role ?? ""}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <LogOut className="size-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 h-14 px-4 lg:px-6 flex items-center gap-4 border-b bg-background/80 backdrop-blur">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden size-9 grid place-items-center rounded-lg border border-border hover:bg-muted"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetHeader className="p-5 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Bird className="size-5 text-primary" /> Colombier
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                  <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                  <div className="pt-4 mt-2 border-t space-y-0.5">
                    <Link
                      to="/parametres"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <Settings className="size-4" /> Paramètres
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <span className="relative">
                        <Bell className="size-4" />
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-destructive" />
                        )}
                      </span>
                      Notifications
                    </Link>
                    <Link
                      to="/profil"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
                    >
                      <div className="size-4 grid place-items-center">
                        <div className="size-4 rounded-full bg-linear-to-br from-primary to-primary/60 text-[8px] font-bold text-primary-foreground grid place-items-center">
                          {user
                            ? user.nom_complet.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                            : "?"}
                        </div>
                      </div>
                      Profil
                    </Link>
                  </div>
                </nav>
                <div className="p-3 border-t">
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <LogOut className="size-4" />
                    Déconnexion
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="lg:hidden font-semibold flex items-center gap-2">
              <Bird className="size-5 text-primary" /> Colombier
            </div>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 border border-transparent hover:border-border transition-colors text-left"
              aria-label="Ouvrir la palette de commandes (Ctrl+K)"
            >
              <Search className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground flex-1">
                Rechercher un pigeon, une cage…
              </span>
              <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 shrink-0">
                ⌘K
              </kbd>
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggle}
                className="size-9 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Basculer le thème clair ou sombre"
              >
                {resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <Link
                to="/notifications"
                className="size-9 grid place-items-center rounded-lg hover:bg-muted transition relative"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
                )}
              </Link>
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="flex-1 p-4 lg:p-8 outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
