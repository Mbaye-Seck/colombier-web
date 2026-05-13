import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { CoupleDetailPage } from "@/pages/couple-detail-page";

export const Route = createFileRoute("/couples/$id")({
  beforeLoad: requireAuth,
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.id)} — Colombier` }],
  }),
  component: CoupleDetailRoute,
});

function CoupleDetailRoute() {
  const { id } = Route.useParams();
  return <CoupleDetailPage id={decodeURIComponent(id)} />;
}
