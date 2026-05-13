import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ReproductionsPage } from "@/pages/reproductions-page";

export const Route = createFileRoute("/reproductions")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Reproductions — Colombier" }] }),
  component: ReproductionsPage,
});
