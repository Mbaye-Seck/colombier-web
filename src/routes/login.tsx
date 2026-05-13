import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LoginPage } from "@/pages/login-page";
import { requireGuest } from "@/lib/route-guards";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: requireGuest,
  head: () => ({ meta: [{ title: "Connexion — Colombier" }] }),
  component: LoginPage,
});
