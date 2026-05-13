export type PigeonStatus = "Actif" | "Reproduction" | "Vendu";

export type Pigeon = {
  ring: string;
  sex: "M" | "F";
  race: string;
  couleur: string;
  age: string;
  statut: PigeonStatus;
  cage: string;
};
