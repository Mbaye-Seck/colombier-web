import type { CoupleSummary } from "@/types/couple";

export function getMockCouples(): CoupleSummary[] {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `C-${String(i + 1).padStart(3, "0")}`,
    male: `SN-2024-${100 + i}`,
    femelle: `SN-2024-${300 + i}`,
    date: "12/02/2026",
    cage: `${["A", "B", "C"][i % 3]}${String((i % 9) + 1).padStart(2, "0")}`,
    active: i % 4 !== 3,
    reproductions: i % 5,
  }));
}
