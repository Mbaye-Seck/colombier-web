import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ParametresPage } from "@/pages/parametres-page";

export const Route = createFileRoute("/parametres")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Paramètres — Colombier" }] }),
  component: ParametresPage,
});
