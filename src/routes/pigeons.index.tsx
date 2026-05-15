import { createFileRoute } from "@tanstack/react-router";
import { PigeonsPage } from "@/pages/pigeons-page";

export const Route = createFileRoute("/pigeons/")({
  head: () => ({ meta: [{ title: "Pigeons — Colombier" }] }),
  component: PigeonsPage,
});
