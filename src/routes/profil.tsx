import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ProfilPage } from "@/pages/profil-page";

export const Route = createFileRoute("/profil")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Profil — Colombier" }] }),
  component: ProfilPage,
});
