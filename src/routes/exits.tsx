import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ExitsPage } from "@/pages/exits-page";

export const Route = createFileRoute("/exits")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Sorties — Colombier" }] }),
  component: ExitsPage,
});
