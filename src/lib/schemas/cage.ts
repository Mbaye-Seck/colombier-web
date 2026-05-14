import { z } from "zod";

export const CAGE_TYPE = ["individuelle", "couple", "quarantaine", "reproduction"] as const;

export const cageCreateSchema = z.object({
  numero: z.string().min(1, "Numéro requis").max(50, "Max 50 caractères"),
  nom: z.string().min(1, "Nom requis").max(100, "Max 100 caractères"),
  type: z.enum(CAGE_TYPE, { required_error: "Type requis" }),
  capacite: z.number().int().min(1).max(255).nullable().optional(),
  superficie: z.number().min(0).max(9999.99).nullable().optional(),
});

export type CageCreateValues = z.infer<typeof cageCreateSchema>;

export const affectationCreateSchema = z.object({
  cage_id: z.number().int().positive(),
  pigeon_id: z.number().int().positive().nullable().optional(),
  couple_id: z.number().int().positive().nullable().optional(),
  motif: z.string().max(255).nullable().optional(),
  date_affectation: z.string().optional(),
});

export type AffectationCreateValues = z.infer<typeof affectationCreateSchema>;

export const cageUpdateSchema = z.object({
  numero: z.string().min(1, "Numéro requis").max(50, "Max 50 caractères").optional(),
  nom: z.string().min(1, "Nom requis").max(100, "Max 100 caractères").optional(),
  type: z.enum(CAGE_TYPE).optional(),
  capacite: z.number().int().min(1).max(255).nullable().optional(),
  superficie: z.number().min(0).max(9999.99).nullable().optional(),
});

export type CageUpdateValues = z.infer<typeof cageUpdateSchema>;
