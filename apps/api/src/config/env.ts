import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4001),
  DATABASE_URL: z.url(),
  CORS_ORIGIN: z.string().min(1),
  /** Clé de signature des cookies de session. 32 caractères minimum. */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET doit faire au moins 32 caractères"),
  /** Durée de validité d'une session admin, en heures. */
  SESSION_HOURS: z.coerce.number().int().positive().max(720).default(12),
  /**
   * Répertoire des images téléversées depuis le back-office.
   *
   * Hors du dépôt et hors du build : ce sont des données, au même titre que la
   * base. En production, y monter un volume persistant — sinon chaque
   * redéploiement repartirait d'un dossier vide.
   */
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  /** Taille maximale d'une image téléversée, en mégaoctets. */
  UPLOAD_MAX_MB: z.coerce.number().positive().max(50).default(5),
  /**
   * Nombre de reverse proxies devant l'API.
   *
   * 0 en local. 1 derrière un nginx/Caddy, 2 si un CDN s'ajoute devant. Sans
   * cela Express voit l'IP du proxy pour tout le monde : le limiteur de
   * tentatives de connexion deviendrait un quota global, et le premier
   * bourrinage bloquerait l'accès à tous.
   */
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration invalide :\n", z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
