import { AVIARY_IDS } from "@/types/cage";
import type { AviaryId, Cage, CageStatus } from "@/types/cage";

function buildAviary(prefix: AviaryId, count: number): Cage[] {
  const seedStatuses: CageStatus[] = [
    "empty",
    "single",
    "couple",
    "empty",
    "single",
    "empty",
    "couple",
    "empty",
  ];
  return Array.from({ length: count }).map((_, i) => {
    const status = seedStatuses[(i + prefix.charCodeAt(0)) % seedStatuses.length];
    const code = `${prefix}${String(i + 1).padStart(2, "0")}`;
    const occupants =
      status === "empty"
        ? []
        : status === "single"
          ? [
              {
                name: "Pigeon",
                sex: (i % 2 ? "F" : "M") as "M" | "F",
                ring: `SN-2024-${100 + i}`,
                race: "Voyageur",
                age: "2 ans",
              },
            ]
          : [
              {
                name: "Mâle",
                sex: "M" as const,
                ring: `SN-2024-${200 + i}`,
                race: "Voyageur",
                age: "2 ans",
              },
              {
                name: "Femelle",
                sex: "F" as const,
                ring: `SN-2024-${300 + i}`,
                race: "Voyageur",
                age: "1 an",
              },
            ];
    return {
      id: `${prefix}-${i}`,
      code,
      status,
      occupants,
      history: [
        { date: "12/03/2026", label: status === "couple" ? "Couple affecté" : "Pigeon affecté" },
        { date: "05/02/2026", label: "Cage nettoyée" },
      ],
    };
  });
}

export const MOCK_CAGES_BY_AVIARY: Record<AviaryId, Cage[]> = {
  A: buildAviary("A", 20),
  B: buildAviary("B", 16),
  C: buildAviary("C", 12),
};

export { AVIARY_IDS };

export const CAGE_STATUS_LABELS: Record<CageStatus, string> = {
  empty: "Libre",
  single: "1 pigeon",
  couple: "Couple",
};
