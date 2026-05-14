import type { Pigeon } from "./pigeon";
import type { Couple } from "./couple";

export type CageType = "individuelle" | "couple" | "quarantaine" | "reproduction";

export interface AffectationCage {
  id: number;
  cage_id: number;
  pigeon_id: number | null;
  couple_id: number | null;
  motif: string | null;
  date_affectation: string;
  date_liberation: string | null;
  actif: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  pigeon?: Pigeon | null;
  couple?: Couple | null;
}

export interface Cage {
  id: number;
  numero: string;
  nom: string;
  type: CageType;
  capacite: number | null;
  superficie: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  is_occupied?: boolean | null;
  occupation_type?: "pigeon" | "couple" | null;
  affectation_active?: AffectationCage | null;
}

// ── UI display types used by cage-grid ────────────────────────────────────────
// Derived from Cage at the API layer; never stored in the backend.

export const AVIARY_IDS = ["A", "B", "C"] as const;
export type AviaryId = (typeof AVIARY_IDS)[number];

export type CageStatus = "empty" | "single" | "couple";

export type CageOccupant = {
  pigeonId: number;
  name: string;
  sex: "M" | "F";
  ring: string;
  race: string;
  age: string;
};

export type CageHistoryItem = { date: string; label: string };

export interface CageView {
  id: string;
  code: string;
  backendId: number;
  affectationId?: number;
  coupleId: number | null;
  status: CageStatus;
  occupants: CageOccupant[];
  history: CageHistoryItem[];
  nom: string;
  type: CageType;
  capacite: number | null;
  superficie: number | null;
}

export const CAGE_STATUS_LABELS: Record<CageStatus, string> = {
  empty: "Libre",
  single: "1 pigeon",
  couple: "Couple",
};
