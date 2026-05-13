export type ExitKind = "Vente" | "Décès" | "Perte";

export type Exit = {
  id: string;
  ring: string;
  type: ExitKind;
  date: string;
  prix?: string;
  acheteur?: string;
  cause?: string;
};
