import { z } from "zod";

export const REPRODUCTION_STATUT = ["en_cours", "terminee", "echec"] as const;

export const reproductionCreateSchema = z.object({
  couple_id: z
    .number({ required_error: "Couple requis", invalid_type_error: "ID invalide" })
    .int()
    .positive("ID invalide"),
  date_ponte: z.string().min(1, "Date de ponte requise"),
  date_eclosion: z.string().nullable().optional(),
  nombre_jeunes: z.number().int().min(0).max(255).nullable().optional(),
  notes: z.string().max(1000, "Max 1000 caractères").nullable().optional(),
  statut: z.enum(REPRODUCTION_STATUT).nullable().optional(),
});

export type ReproductionCreateValues = z.infer<typeof reproductionCreateSchema>;

export const reproductionUpdateSchema = z.object({
  date_ponte: z.string().optional(),
  date_eclosion: z.string().nullable().optional(),
  nombre_jeunes: z.number().int().min(0).max(255).nullable().optional(),
  notes: z.string().max(1000, "Max 1000 caractères").nullable().optional(),
  statut: z.enum(REPRODUCTION_STATUT).optional(),
});

export type ReproductionUpdateValues = z.infer<typeof reproductionUpdateSchema>;

export const offspringPigeonSchema = z.object({
  code_bague: z.string().min(1, "Code bague requis").max(30, "Max 30 caractères"),
  sexe: z.enum(["male", "femelle"] as const, { required_error: "Sexe requis" }),
  couleur: z.string().max(100, "Max 100 caractères").optional(),
  date_naissance: z.string().nullable().optional(),
});

export type OffspringPigeonValues = z.infer<typeof offspringPigeonSchema>;

export const generateOffspringSchema = z.object({
  pigeons: z
    .array(offspringPigeonSchema)
    .min(1, "Au moins un jeune requis")
    .max(50, "Maximum 50 jeunes"),
});

export type GenerateOffspringValues = z.infer<typeof generateOffspringSchema>;
