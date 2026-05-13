import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { CouplesPage } from "@/pages/couples-page";

export const Route = createFileRoute("/couples")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Couples — Colombier" }] }),
  component: CouplesPage,
});
