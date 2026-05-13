import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ReproductionDetailPage } from "@/pages/reproduction-detail-page";

export const Route = createFileRoute("/reproductions/$id")({
  beforeLoad: requireAuth,
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.id)} — Colombier` }],
  }),
  component: ReproductionDetailRoute,
});

function ReproductionDetailRoute() {
  const { id } = Route.useParams();
  return <ReproductionDetailPage id={decodeURIComponent(id)} />;
}
