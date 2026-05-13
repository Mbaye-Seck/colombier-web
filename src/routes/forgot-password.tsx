import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/pages/forgot-password-page";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — Colombier" }] }),
  component: ForgotPasswordPage,
});
