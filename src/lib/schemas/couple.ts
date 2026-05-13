import { z } from "zod";

export const coupleCreateSchema = z.object({
  male: z.string().min(1, "Matricule mâle requis").max(32),
  femelle: z.string().min(1, "Matricule femelle requis").max(32),
  cage: z.string().min(1, "Cage requise").max(16),
  date: z.string().min(1, "Date de formation requise"),
});

export type CoupleCreateValues = z.infer<typeof coupleCreateSchema>;
