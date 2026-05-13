import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guards";
import { ExitDetailPage } from "@/pages/exit-detail-page";

export const Route = createFileRoute("/exits/$id")({
  beforeLoad: requireAuth,
  head: ({ params }) => ({
    meta: [{ title: `Sortie ${decodeURIComponent(params.id)} — Colombier` }],
  }),
  component: ExitDetailRoute,
});

function ExitDetailRoute() {
  const { id } = Route.useParams();
  return <ExitDetailPage id={decodeURIComponent(id)} />;
}
