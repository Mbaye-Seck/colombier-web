import { z } from "zod";

export const profilSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères.").max(80),
  email: z.string().email("Adresse email invalide."),
  location: z.string().max(100).optional(),
});

export type ProfilValues = z.infer<typeof profilSchema>;
