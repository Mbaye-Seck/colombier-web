import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "L’email est requis").email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis").min(6, "Au moins 6 caractères"),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
