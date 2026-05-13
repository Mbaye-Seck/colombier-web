import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { CageDetailPage } from "@/pages/cage-detail-page";

export const Route = createFileRoute("/cages/$code")({
  beforeLoad: requireAuth,
  head: ({ params }) => ({
    meta: [{ title: `Cage ${decodeURIComponent(params.code)} — Colombier` }],
  }),
  component: CageDetailRoute,
});

function CageDetailRoute() {
  const { code } = Route.useParams();
  return <CageDetailPage code={decodeURIComponent(code)} />;
}
