import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4001),
  DATABASE_URL: z.url(),
  CORS_ORIGIN: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration invalide :\n", z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
