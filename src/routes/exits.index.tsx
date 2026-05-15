import { createFileRoute } from "@tanstack/react-router";
import { ExitsPage } from "@/pages/exits-page";

export const Route = createFileRoute("/exits/")({
  head: () => ({ meta: [{ title: "Sorties — Colombier" }] }),
  component: ExitsPage,
});
