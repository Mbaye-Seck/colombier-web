import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { CagesPage } from "@/pages/cages-page";

export const Route = createFileRoute("/cages")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Volières & Cages — Colombier" },
      { name: "description", content: "Visualisation interactive des cages de l'élevage." },
    ],
  }),
  component: CagesPage,
});
