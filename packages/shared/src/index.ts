import { z } from "zod";

/** Le F CFA n'a pas de décimales : tous les montants sont des entiers. */
export const CURRENCY = "XOF" as const;

export const COMMUNES_ABIDJAN = [
  "Cocody",
  "Plateau",
  "Marcory",
  "Treichville",
  "Yopougon",
  "Abobo",
  "Adjamé",
  "Attécoubé",
  "Koumassi",
  "Port-Bouët",
  "Bingerville",
  "Songon",
  "Anyama",
  "Autre",
] as const;

/** Format imposé par le design : +225 07 00 00 00 00 */
export const phoneCI = z
  .string()
  .trim()
  .regex(/^\+225 \d{2} \d{2} \d{2} \d{2} \d{2}$/, "Format attendu : +225 07 00 00 00 00");

export const contactSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  phone: phoneCI,
  commune: z.enum(COMMUNES_ABIDJAN),
});

export type Contact = z.infer<typeof contactSchema>;
