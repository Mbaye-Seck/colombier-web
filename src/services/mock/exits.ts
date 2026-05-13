import type { Exit } from "@/types/exit";

export const MOCK_EXITS: Exit[] = [
  {
    id: "S-014",
    ring: "SN-2023-088",
    type: "Vente",
    date: "12/03/2026",
    prix: "850 €",
    acheteur: "M. Lefèvre",
  },
  {
    id: "S-013",
    ring: "SN-2023-072",
    type: "Décès",
    date: "08/03/2026",
    cause: "Maladie respiratoire",
  },
  {
    id: "S-012",
    ring: "SN-2024-055",
    type: "Vente",
    date: "01/03/2026",
    prix: "1 200 €",
    acheteur: "Coop. Régionale",
  },
  {
    id: "S-011",
    ring: "SN-2023-019",
    type: "Perte",
    date: "21/02/2026",
    cause: "Concours - non revenu",
  },
  { id: "S-010", ring: "SN-2022-104", type: "Décès", date: "15/02/2026", cause: "Vieillesse" },
  {
    id: "S-009",
    ring: "SN-2024-007",
    type: "Vente",
    date: "10/02/2026",
    prix: "650 €",
    acheteur: "M. Bertrand",
  },
];
