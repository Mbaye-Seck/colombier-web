import { z } from "zod";

export const pigeonCreateSchema = z.object({
  ring: z.string().min(1, "Matricule requis").max(32),
  sexe: z.enum(["M", "F"]),
  race: z.string().min(1, "Race requise").max(64),
});

export type PigeonCreateValues = z.infer<typeof pigeonCreateSchema>;
