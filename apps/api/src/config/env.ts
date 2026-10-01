import "dotenv/config";
import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4001),
    DATABASE_URL: z.url(),
    /**
     * Connexions maximales du pool Postgres, PAR PROCESSUS.
     *
     * 10 pour un serveur unique. En serverless (Vercel), chaque instance chaude
     * ouvre son propre pool : 10 × N instances épuise vite une base modeste. On
     * y descend à 1–3, derrière l'URL poolée du fournisseur (Neon, Supabase).
     */
    DATABASE_POOL_MAX: z.coerce.number().int().positive().max(50).default(10),
    CORS_ORIGIN: z.string().min(1),
    /** Clé de signature des cookies de session. 32 caractères minimum. */
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET doit faire au moins 32 caractères"),
    /** Durée de validité d'une session admin, en heures. */
    SESSION_HOURS: z.coerce.number().int().positive().max(720).default(12),
    /**
     * Domaine du cookie de session (`velynaliving.com`). Absent, le cookie reste
     * attaché au seul hôte de l'API — suffisant tant que seul le navigateur
     * l'envoie à l'API. À renseigner si le front doit aussi le recevoir.
     */
    SESSION_DOMAIN: z.string().min(1).optional(),
    /**
     * Répertoire des images téléversées depuis le back-office.
     *
     * Hors du dépôt et hors du build : ce sont des données, au même titre que la
     * base. En production, un volume persistant (Docker) ou un dossier dédié du
     * serveur (Forge) — sinon chaque redéploiement repartirait d'un dossier vide.
     *
     * Le défaut relatif ne vaut que pour le développement : en production, la
     * garde de `lib/uploads.ts` refuse un chemin relatif ou pris dans le dossier
     * de déploiement.
     */
    UPLOAD_DIR: z.string().min(1).default("uploads"),
    /**
     * Où vivent les octets des images téléversées.
     *
     * `disk` : UPLOAD_DIR, pour un serveur avec un disque qui survit aux
     * déploiements (Docker + volume, Forge). `blob` : Vercel Blob, pour une
     * fonction serverless, qui n'a AUCUN disque persistant. Le chemin stocké en
     * base (`/uploads/<nom>`) est le même dans les deux cas.
     */
    UPLOAD_STORAGE: z.enum(["disk", "blob"]).default("disk"),
    /** Jeton du store Vercel Blob. Injecté par Vercel quand le store est connecté au projet. */
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
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
  })
  .refine((config) => config.UPLOAD_STORAGE !== "blob" || config.BLOB_READ_WRITE_TOKEN, {
    message: "BLOB_READ_WRITE_TOKEN est requis quand UPLOAD_STORAGE=blob",
    path: ["BLOB_READ_WRITE_TOKEN"],
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration invalide :\n", z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
