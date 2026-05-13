export const AVIARY_IDS = ["A", "B", "C"] as const;
export type AviaryId = (typeof AVIARY_IDS)[number];

export type CageStatus = "empty" | "single" | "couple";

export type CageOccupant = {
  name: string;
  sex: "M" | "F";
  ring: string;
  race: string;
  age: string;
};

export type CageHistoryItem = { date: string; label: string };

export type Cage = {
  id: string;
  code: string;
  status: CageStatus;
  occupants: CageOccupant[];
  history: CageHistoryItem[];
};
