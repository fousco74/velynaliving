import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { isAbsolute, resolve, sep } from "node:path";
import { env } from "../config/env.js";

/**
 * Résolu une fois, au démarrage.
 *
 * Un chemin relatif part du répertoire courant du PROCESSUS — donc de là où le
 * gestionnaire de services a lancé l'API, pas de la racine du dépôt.
 */
export const UPLOAD_DIR = isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : resolve(process.cwd(), env.UPLOAD_DIR);

/**
 * En production, le dossier doit être choisi explicitement et vivre hors du
 * dossier de déploiement.
 *
 * Un hébergement à releases atomiques (Laravel Forge, Deployer, Capistrano)
 * installe chaque déploiement dans `releases/<horodatage>` puis fait pointer
 * `current` dessus. Un chemin relatif suit le répertoire de lancement du
 * service, atterrit donc DANS la release, et le déploiement suivant repart
 * d'un dossier vide pendant que la base continue de référencer `/uploads/…` :
 * les images « disparaissent » du site, puis l'ancienne release est purgée et
 * les fichiers avec elle.
 *
 * On refuse de démarrer plutôt que d'écrire dans un dossier condamné : la
 * perte ne se voit qu'au déploiement d'après, quand il est déjà trop tard.
 */
const refuserUploadDir = (raison: string): never => {
  console.error(
    [
      `UPLOAD_DIR inutilisable en production : ${raison}.`,
      `  valeur reçue  : ${env.UPLOAD_DIR}`,
      `  chemin résolu : ${UPLOAD_DIR}`,
      "  Attendu : un chemin ABSOLU, hors du dossier de déploiement et conservé",
      "  d'un déploiement à l'autre (ex. /home/forge/velyna-uploads), ou un",
      "  volume persistant monté à cet emplacement.",
    ].join("\n"),
  );
  process.exit(1);
};

// Le stockage blob n'a pas de dossier : ni garde, ni création. Sur Vercel, le
// disque est en lecture seule, et `mkdirSync` y ferait planter le démarrage.
if (env.UPLOAD_STORAGE === "disk" && env.NODE_ENV === "production") {
  if (!isAbsolute(env.UPLOAD_DIR)) {
    refuserUploadDir("le chemin est relatif, donc suspendu au répertoire de lancement");
  }

  // Un chemin absolu peut très bien désigner l'intérieur de la release : c'est
  // le piège exact des déploiements atomiques, on le nomme.
  const segments = UPLOAD_DIR.split(sep);
  if (segments.includes("releases") || segments.includes("current")) {
    refuserUploadDir("le chemin traverse le dossier de déploiement (releases/ ou current)");
  }
}

if (env.UPLOAD_STORAGE === "disk") mkdirSync(UPLOAD_DIR, { recursive: true });

export const MAX_UPLOAD_BYTES = env.UPLOAD_MAX_MB * 1024 * 1024;

/**
 * Noms produits par `safeFileName`. Toute lecture ou suppression par nom passe
 * par ce filtre : un seul segment, sans remontée de chemin possible.
 */
export const SAFE_UPLOAD_NAME = /^[a-z0-9-]+\.(jpeg|png|webp|avif)$/;

/** Types acceptés, et l'extension qu'on leur donne sur le disque. */
export const ACCEPTED_TYPES = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type AcceptedType = keyof typeof ACCEPTED_TYPES;

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

const ascii = (buffer: Buffer, start: number, end: number) =>
  buffer.subarray(start, end).toString("ascii");

/**
 * Identifie le format par ses octets d'en-tête, pas par l'en-tête HTTP.
 *
 * Le `Content-Type` est déclaré par le client : s'y fier laisserait déposer
 * n'importe quoi sous un nom en `.jpeg`. Le format réel est la seule chose
 * qu'on puisse vérifier côté serveur.
 */
export const sniffImageType = (buffer: Buffer): AcceptedType | null => {
  if (buffer.length < 16) return null;

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP") return "image/webp";
  if (ascii(buffer, 4, 8) === "ftyp" && ascii(buffer, 8, 12).startsWith("avif"))
    return "image/avif";

  return null;
};

/**
 * Nom de fichier sûr : on garde une trace lisible du nom d'origine pour
 * s'y retrouver dans le dossier, mais le suffixe aléatoire garantit qu'un
 * second dépôt n'écrase jamais le premier — deux produits peuvent très bien
 * arriver avec un `photo.jpg`.
 */
export const safeFileName = (original: string | undefined, extension: string) => {
  const base = (original ?? "image")
    .normalize("NFD")
    .replace(/\.[^.]*$/, "")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base || "image"}-${randomBytes(4).toString("hex")}.${extension}`;
};
