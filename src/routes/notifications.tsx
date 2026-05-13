import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { NotificationsPage } from "@/pages/notifications-page";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Notifications — Colombier" }] }),
  component: NotificationsPage,
});
