import { z } from "zod";

export const cageCreateSchema = z.object({
  aviary: z.enum(["A", "B", "C"], { required_error: "Volière requise" }),
  number: z.number({ required_error: "Numéro requis" }).int().min(1, "Min 1").max(99, "Max 99"),
  notes: z.string().max(300).optional(),
});

export type CageCreateValues = z.infer<typeof cageCreateSchema>;
