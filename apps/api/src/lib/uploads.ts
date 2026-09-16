import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { isAbsolute, resolve } from "node:path";
import { env } from "../config/env.js";

/** Résolu une fois : un chemin relatif part de la racine de l'API, pas du cwd. */
export const UPLOAD_DIR = isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : resolve(process.cwd(), env.UPLOAD_DIR);

mkdirSync(UPLOAD_DIR, { recursive: true });

export const MAX_UPLOAD_BYTES = env.UPLOAD_MAX_MB * 1024 * 1024;

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
