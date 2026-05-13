import type { ReproductionCard } from "@/types/reproduction";

export function getMockReproductions(): ReproductionCard[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `R-${String(i + 1).padStart(3, "0")}`,
    couple: `C-${String(i + 1).padStart(3, "0")}`,
    pere: `SN-2024-${100 + i}`,
    mere: `SN-2024-${300 + i}`,
    ponte: `0${(i % 8) + 1}/03/2026`,
    eclosion: `${15 + (i % 5)}/03/2026`,
    jeunes: (i % 3) + 1,
    jeunesIds: Array.from({ length: (i % 3) + 1 }).map(
      (_, j) => `SN-2026-${(i * 3 + j + 1).toString().padStart(3, "0")}`,
    ),
  }));
}
