import type { Pigeon } from "./pigeon";

export type CoupleStatut = "actif" | "rompu";

export interface Couple {
  id: number;
  male_id: number;
  femelle_id: number;
  date_formation: string;
  date_rupture: string | null;
  statut: CoupleStatut;
  user_id: number;
  created_at: string;
  updated_at: string;
  male?: Pigeon | null;
  femelle?: Pigeon | null;
  reproductions?: import("./reproduction").Reproduction[];
}
