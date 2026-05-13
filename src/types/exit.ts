import type { Pigeon } from "./pigeon";

export type SortieType = "vente" | "deces" | "perte";

export interface Sortie {
  id: number;
  pigeon_id: number;
  type_sortie: SortieType;
  date_sortie: string;
  prix: number | null;
  acheteur: string | null;
  cause: string | null;
  circonstance: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  pigeon?: Pigeon | null;
}
