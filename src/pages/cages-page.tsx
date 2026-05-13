import { AppShell } from "@/layouts/app-shell";
import { PageHeader } from "@/components/domain";
import { CageGrid } from "@/features/cages";

export function CagesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Volières & Cages"
        subtitle="Visualisez et gérez l'occupation de chaque cage en un coup d'œil."
      />
      <CageGrid />
    </AppShell>
  );
}
