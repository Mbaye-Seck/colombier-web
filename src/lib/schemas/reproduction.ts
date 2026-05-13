import { z } from "zod";

export const reproductionCreateSchema = z.object({
  coupleId: z.string().min(1, "Couple requis"),
  ponte: z.string().min(1, "Date de ponte requise"),
  eclosionPrevue: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type ReproductionCreateValues = z.infer<typeof reproductionCreateSchema>;
