import { z } from "zod";

export const SORTIE_TYPE = ["vente", "deces", "perte"] as const;

export const exitCreateSchema = z
  .object({
    pigeon_id: z
      .number({ required_error: "Pigeon requis", invalid_type_error: "ID invalide" })
      .int()
      .positive("ID invalide"),
    type_sortie: z.enum(SORTIE_TYPE, { required_error: "Type de sortie requis" }),
    date_sortie: z.string().min(1, "Date requise"),
    prix: z.number().min(0).max(9_999_999.99).nullable().optional(),
    acheteur: z.string().max(255).nullable().optional(),
    cause: z.string().max(255).nullable().optional(),
    circonstance: z.string().max(2000).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type_sortie === "vente" && !val.acheteur) {
      ctx.addIssue({
        code: "custom",
        path: ["acheteur"],
        message: "Acheteur requis pour une vente",
      });
    }
  });

export type ExitCreateValues = z.infer<typeof exitCreateSchema>;
