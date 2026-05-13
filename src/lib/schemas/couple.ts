import { z } from "zod";

export const COUPLE_STATUT = ["actif", "rompu"] as const;

export const coupleCreateSchema = z.object({
  male_id: z
    .number({ required_error: "Pigeon mâle requis", invalid_type_error: "ID invalide" })
    .int()
    .positive("ID invalide"),
  femelle_id: z
    .number({ required_error: "Pigeon femelle requis", invalid_type_error: "ID invalide" })
    .int()
    .positive("ID invalide"),
  date_formation: z.string().min(1, "Date de formation requise"),
  date_rupture: z.string().nullable().optional(),
  statut: z.enum(COUPLE_STATUT).nullable().optional(),
});

export type CoupleCreateValues = z.infer<typeof coupleCreateSchema>;

export const coupleUpdateSchema = z.object({
  statut: z.enum(COUPLE_STATUT).optional(),
  date_formation: z.string().optional(),
  date_rupture: z.string().nullable().optional(),
});

export type CoupleUpdateValues = z.infer<typeof coupleUpdateSchema>;
