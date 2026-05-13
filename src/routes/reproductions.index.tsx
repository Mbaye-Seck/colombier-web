import { createFileRoute } from "@tanstack/react-router";
import { ReproductionsPage } from "@/pages/reproductions-page";

export const Route = createFileRoute("/reproductions/")({
  head: () => ({ meta: [{ title: "Reproductions — Colombier" }] }),
  component: ReproductionsPage,
});
