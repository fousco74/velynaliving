import express, { type RequestHandler } from "express";
import { readdir, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BlobNotFoundError, del, head, list, put } from "@vercel/blob";
import { env } from "../config/env.js";
import { SAFE_UPLOAD_NAME, UPLOAD_DIR, type AcceptedType } from "./uploads.js";

/**
 * Où vivent les octets des images téléversées.
 *
 * Le reste de l'application ne manipule que des NOMS (`parfum-a1b2c3d4.webp`)
 * et des chemins publics `/uploads/<nom>` : la base, le front et son relais
 * ignorent tout du pilote. Changer de stockage ne touche donc aucune donnée.
 */
export type UploadStorage = {
  readonly driver: "disk" | "blob";
  save(name: string, body: Buffer, type: AcceptedType): Promise<void>;
  /** Pour le balayage des orphelins : nom et date de dépôt de chaque image. */
  list(): Promise<{ name: string; uploadedAt: Date; bytes: number }[]>;
  remove(name: string): Promise<void>;
  /** Monté sur `/uploads`. */
  serve: RequestHandler;
};

const diskStorage = (): UploadStorage => ({
  driver: "disk",

  save: (name, body) => writeFile(join(UPLOAD_DIR, name), body),

  list: async () => {
    const names = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
    const files = [];

    for (const name of names) {
      const info = await stat(join(UPLOAD_DIR, name));
      if (info.isFile()) files.push({ name, uploadedAt: info.mtime, bytes: info.size });
    }

    return files;
  },

  remove: (name) => unlink(join(UPLOAD_DIR, name)),

  /**
   * Le nom porte un suffixe aléatoire, donc une URL désigne toujours les mêmes
   * octets : on peut la mettre en cache sans limite. `express.static` refuse
   * les remontées de chemin (`../`).
   */
  serve: express.static(UPLOAD_DIR, {
    maxAge: "1y",
    immutable: true,
    index: false,
    dotfiles: "ignore",
  }),
});

/**
 * Vercel Blob, pour une API en fonction serverless : le disque d'une fonction
 * est en lecture seule et ne survit pas à l'instance.
 *
 * Les images sont rangées sous `uploads/<nom>`, sans suffixe aléatoire côté
 * Blob : `safeFileName` en ajoute déjà un, et garder le nom tel quel permet de
 * retrouver un blob à partir du chemin stocké en base.
 */
const blobStorage = (token: string): UploadStorage => {
  const PREFIX = "uploads/";

  return {
    driver: "blob",

    save: async (name, body, type) => {
      await put(`${PREFIX}${name}`, body, {
        access: "public",
        addRandomSuffix: false,
        contentType: type,
        cacheControlMaxAge: 31_536_000,
        token,
      });
    },

    list: async () => {
      const files = [];
      let cursor: string | undefined;

      do {
        const page = await list({ prefix: PREFIX, cursor, limit: 1000, token });
        for (const blob of page.blobs) {
          files.push({
            name: blob.pathname.slice(PREFIX.length),
            uploadedAt: blob.uploadedAt,
            bytes: blob.size,
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);

      return files;
    },

    remove: (name) => del(`${PREFIX}${name}`, { token }),

    /**
     * Redirection vers l'URL publique du blob plutôt que relais des octets :
     * la fonction ne paie ni la bande passante ni la durée du transfert. Le
     * relais `/api/uploads/…` du front suit la redirection (`fetch` le fait
     * par défaut), le navigateur ne voit donc jamais l'URL Blob.
     */
    serve: async (req, res, next) => {
      const name = req.path.slice(1);
      if (!SAFE_UPLOAD_NAME.test(name)) return next();

      try {
        const blob = await head(`${PREFIX}${name}`, { token });
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        res.redirect(302, blob.url);
      } catch (err) {
        // Absent du store : on laisse filer jusqu'au 404 de l'application.
        if (err instanceof BlobNotFoundError) return next();
        next(err);
      }
    },
  };
};

export const storage: UploadStorage =
  env.UPLOAD_STORAGE === "blob" && env.BLOB_READ_WRITE_TOKEN
    ? blobStorage(env.BLOB_READ_WRITE_TOKEN)
    : diskStorage();
