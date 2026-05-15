import { createFileRoute } from "@tanstack/react-router";
import { CouplesPage } from "@/pages/couples-page";

export const Route = createFileRoute("/couples/")({
  head: () => ({ meta: [{ title: "Couples — Colombier" }] }),
  component: CouplesPage,
});
