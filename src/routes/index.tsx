import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard-page";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Dashboard — Colombier" },
      { name: "description", content: "Tableau de bord de gestion d'élevage de pigeons." },
    ],
  }),
  component: DashboardPage,
});
