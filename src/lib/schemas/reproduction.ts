import { z } from "zod";

export const REPRODUCTION_STATUT = ["en_cours", "terminee", "echec"] as const;

export const reproductionCreateSchema = z.object({
  couple_id: z
    .number({ required_error: "Couple requis", invalid_type_error: "ID invalide" })
    .int()
    .positive("ID invalide"),
  date_ponte: z.string().min(1, "Date de ponte requise"),
  date_eclosion: z.string().nullable().optional(),
  nombre_jeunes: z
    .number()
    .int()
    .min(0)
    .max(255)
    .nullable()
    .optional(),
  notes: z.string().max(1000, "Max 1000 caractères").nullable().optional(),
  statut: z.enum(REPRODUCTION_STATUT).nullable().optional(),
});

export type ReproductionCreateValues = z.infer<typeof reproductionCreateSchema>;
