export type PigeonSexe = "male" | "femelle";
export type PigeonStatut = "actif" | "vendu" | "mort" | "perdu";

export interface Pigeon {
  id: number;
  code_bague: string;
  sexe: PigeonSexe;
  race: string | null;
  couleur: string | null;
  photo_url: string | null;
  date_naissance: string | null;
  statut: PigeonStatut;
  user_id: number;
  reproduction_id: number | null;
  pere_id: number | null;
  mere_id: number | null;
  created_at: string;
  updated_at: string;
  pere?: Pigeon | null;
  mere?: Pigeon | null;
}

export interface PigeonStub {
  id: number;
  code_bague: string;
  sexe: PigeonSexe;
  race: string | null;
  couleur: string | null;
  statut: PigeonStatut;
}

export interface AncestorNode {
  pigeon: PigeonStub;
  pere: AncestorNode | null;
  mere: AncestorNode | null;
}

export interface ChildPigeon extends PigeonStub {
  role: "pere" | "mere";
}
