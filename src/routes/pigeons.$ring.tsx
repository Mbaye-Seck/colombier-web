import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { PigeonDetailPage } from "@/pages/pigeon-detail-page";

export const Route = createFileRoute("/pigeons/$ring")({
  beforeLoad: requireAuth,
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.ring)} — Colombier` }],
  }),
  component: PigeonDetailRoute,
});

function PigeonDetailRoute() {
  const { ring } = Route.useParams();
  return <PigeonDetailPage ring={decodeURIComponent(ring)} />;
}
