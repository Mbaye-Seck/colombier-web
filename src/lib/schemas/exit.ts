import { z } from "zod";

export const exitCreateSchema = z
  .object({
    ring: z.string().min(1, "Matricule requis").max(32),
    type: z.enum(["Vente", "Décès", "Perte"], { required_error: "Type requis" }),
    date: z.string().min(1, "Date requise"),
    // Vente
    prix: z.string().optional(),
    acheteur: z.string().max(100).optional(),
    // Décès / Perte
    cause: z.string().max(200).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type === "Vente" && !val.acheteur) {
      ctx.addIssue({
        code: "custom",
        path: ["acheteur"],
        message: "Acheteur requis pour une vente",
      });
    }
  });

export type ExitCreateValues = z.infer<typeof exitCreateSchema>;
