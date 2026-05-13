import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/login-page";
import { requireGuest } from "@/lib/route-guards";

export const Route = createFileRoute("/login")({
  beforeLoad: requireGuest,
  head: () => ({ meta: [{ title: "Connexion — Colombier" }] }),
  component: LoginPage,
});
