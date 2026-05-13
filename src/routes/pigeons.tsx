import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { PigeonsPage } from "@/pages/pigeons-page";

export const Route = createFileRoute("/pigeons")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Pigeons — Colombier" }] }),
  component: PigeonsPage,
});
