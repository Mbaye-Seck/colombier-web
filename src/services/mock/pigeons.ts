import type { Pigeon } from "@/types/pigeon";

export function getMockPigeons(): Pigeon[] {
  return Array.from({ length: 14 }).map((_, i) => ({
    ring: `SN-2024-${String(101 + i).padStart(3, "0")}`,
    sex: i % 2 ? "F" : "M",
    race: ["Voyageur", "Texan", "Carneau", "Mondain"][i % 4],
    couleur: ["Bleu barré", "Rouge", "Écaillé", "Noir"][i % 4],
    age: `${(i % 5) + 1} an${i % 5 ? "s" : ""}`,
    statut: (["Actif", "Reproduction", "Actif", "Vendu"] as const)[i % 4],
    cage: `${["A", "B", "C"][i % 3]}${String((i % 10) + 1).padStart(2, "0")}`,
  }));
}
