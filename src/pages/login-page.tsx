import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/domain";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store";
import { setSession } from "@/store/slices/authSlice";
import { Bird, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const session = await login(data).unwrap();

      if (session.user.role === "admin") {
        form.setError("root", {
          message:
            "Accès réservé aux éleveurs. Les administrateurs doivent utiliser le panneau d'administration.",
        });
        return;
      }

      dispatch(setSession(session));
      router.invalidate();
      toast.success(`Bienvenue, ${session.user.nom_complet} !`);
      void navigate({ to: "/" });
    } catch (err) {
      console.error("[auth] login failed:", err);

      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number | string }).status
          : null;

      if (status === 429) {
        form.setError("root", { message: "Trop de tentatives. Réessayez dans quelques minutes." });
      } else if (status === "FETCH_ERROR") {
        form.setError("root", {
          message: "Impossible de joindre le serveur. Vérifiez votre connexion.",
        });
      } else {
        form.setError("root", { message: "Email ou mot de passe incorrect." });
      }
    }
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <Bird className="size-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Colombier</div>
              <div className="text-xs text-muted-foreground">Gestion d'élevage</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Connectez-vous à votre espace éleveur.
          </p>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {form.formState.errors.root && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              >
                {form.formState.errors.root.message}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="login-email">
                Email
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 h-10 rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/30">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="login-password">
                Mot de passe
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 h-10 rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/30">
                <Lock className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="rounded" {...form.register("remember")} />
                Se souvenir
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Connexion…
                </>
              ) : (
                <>
                  Se connecter <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Pas encore de compte ?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => toast.message("Contactez votre administrateur pour obtenir un accès.")}
            >
              Demander un accès
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:block bg-linear-to-br from-primary/15 via-cage-couple-soft/30 to-cage-empty-soft/30 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 gap-2 p-12 opacity-60">
          {Array.from({ length: 60 }).map((_, i) => {
            const tones = [
              "bg-cage-empty-soft border-cage-empty-border",
              "bg-cage-single-soft border-cage-single-border",
              "bg-cage-couple-soft border-cage-couple-border",
            ];
            return <div key={i} className={`aspect-square rounded-lg border-2 ${tones[i % 3]}`} />;
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-12 bg-linear-to-t from-background/90 to-transparent">
          <h2 className="text-xl font-semibold tracking-tight">
            Une vision claire de votre élevage.
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Cages, couples, reproductions et sorties — tout au même endroit, dans une interface
            pensée pour les éleveurs.
          </p>
        </div>
      </div>
    </div>
  );
}
