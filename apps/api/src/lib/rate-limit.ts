import type { RequestHandler } from "express";

/**
 * Limiteur de tentatives, en mémoire.
 *
 * Sans dépendance ni Redis, volontairement : le back-office compte quelques
 * comptes et l'API tourne en un seul processus. Le compteur vit donc dans le
 * processus — il repart à zéro au redémarrage, et deux réplicas auraient
 * chacun le leur. C'est assez pour rendre un bourrinage impraticable ; le jour
 * où l'API se réplique, un store partagé remplacera ce fichier sans toucher
 * aux routes.
 *
 * ⚠️ Repose sur `req.ip`, donc sur `trust proxy` : derrière un reverse proxy
 * mal configuré, toutes les requêtes partagent l'IP du proxy et le quota
 * devient global. Voir TRUST_PROXY dans config/env.ts.
 */
export const rateLimit = ({
  windowMs,
  max,
  message,
}: {
  windowMs: number;
  max: number;
  message: string;
}): RequestHandler => {
  const hits = new Map<string, number[]>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? "inconnu";

    // Purge opportuniste : pas de minuteur qui tourne pour rien.
    for (const [ip, stamps] of hits) {
      const kept = stamps.filter((at) => now - at < windowMs);
      if (kept.length === 0) hits.delete(ip);
      else hits.set(ip, kept);
    }

    const recent = hits.get(key) ?? [];

    if (recent.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - recent[0]!)) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: message });
    }

    hits.set(key, [...recent, now]);
    next();
  };
};
