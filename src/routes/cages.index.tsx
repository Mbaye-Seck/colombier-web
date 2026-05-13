import { createFileRoute } from "@tanstack/react-router";
import { CagesPage } from "@/pages/cages-page";

export const Route = createFileRoute("/cages/")({
  head: () => ({
    meta: [
      { title: "Volières & Cages — Colombier" },
      { name: "description", content: "Visualisation interactive des cages de l'élevage." },
    ],
  }),
  component: CagesPage,
});
