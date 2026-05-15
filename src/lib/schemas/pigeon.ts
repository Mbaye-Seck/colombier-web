import { z } from "zod";

export const PIGEON_SEXE = ["male", "femelle"] as const;
export const PIGEON_STATUT = ["actif", "vendu", "mort", "perdu"] as const;

export const pigeonCreateSchema = z.object({
  code_bague: z
    .string()
    .min(1, "Matricule requis")
    .max(30, "Max 30 caractères"),
  sexe: z.enum(PIGEON_SEXE, { required_error: "Sexe requis" }),
  race: z.string().max(100, "Max 100 caractères").nullable().optional(),
  couleur: z.string().max(100, "Max 100 caractères").nullable().optional(),
  photo: z
    .string()
    .url("URL invalide")
    .max(500)
    .nullable()
    .optional(),
  date_naissance: z.string().nullable().optional(),
  statut: z.enum(PIGEON_STATUT).nullable().optional(),
  pere_id: z.number().int().positive().nullable().optional(),
  mere_id: z.number().int().positive().nullable().optional(),
  reproduction_id: z.number().int().positive().nullable().optional(),
});

export type PigeonCreateValues = z.infer<typeof pigeonCreateSchema>;

export const pigeonUpdateSchema = pigeonCreateSchema.partial();
export type PigeonUpdateValues = z.infer<typeof pigeonUpdateSchema>;

// Form schema — subset of fields shown in create/edit dialogs.
// Excludes statut (exit statuses are set via Sorties API, not direct update).
export const pigeonFormSchema = z.object({
  code_bague: z.string().min(1, "Matricule requis").max(30, "Max 30 caractères"),
  sexe: z.enum(PIGEON_SEXE, { required_error: "Sexe requis" }),
  race: z.string().max(100, "Max 100 caractères").optional(),
  couleur: z.string().max(100, "Max 100 caractères").optional(),
  date_naissance: z.string().optional(),
  pere_id: z.number().int().positive().nullable().optional(),
  mere_id: z.number().int().positive().nullable().optional(),
});

export type PigeonFormValues = z.infer<typeof pigeonFormSchema>;
