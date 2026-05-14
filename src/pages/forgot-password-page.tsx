import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/domain";
import { Bird, Mail, ArrowRight, ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    toast.success(`Si l’adresse ${data.email} est associée à un compte, un lien de réinitialisation vous sera envoyé.`);
  });

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Bird className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">Colombier</span>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          <h1 className="text-xl font-semibold tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="forgot-email">
                Email
              </label>
              <div className="mt-1.5 flex items-center gap-2 px-3 h-10 rounded-lg border bg-background">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="flex-1 bg-transparent outline-none text-sm"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Envoyer le lien <ArrowRight className="size-4" />
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
