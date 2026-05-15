import type { Pigeon } from "./pigeon";

export type ReproductionStatut = "en_cours" | "terminee" | "echec";

export interface Reproduction {
  id: number;
  couple_id: number;
  date_ponte: string;
  date_eclosion: string | null;
  nombre_jeunes: number | null;
  notes: string | null;
  statut: ReproductionStatut;
  user_id: number;
  created_at: string;
  updated_at: string;
  couple?: import("./couple").Couple | null;
  pigeons?: Pigeon[];
}
