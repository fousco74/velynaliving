import type { RequestHandler } from "express";
import { SESSION_COOKIE, readToken } from "../lib/session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: { userId: number; email: string };
    }
  }
}

/**
 * Express 5 n'expose pas `req.cookies` (cookie-parser est un module à part).
 * Le besoin se limite à un cookie précis : dix lignes évitent une dépendance.
 */
const readCookie = (header: string | undefined, name: string) => {
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }

  return undefined;
};

export const currentAdmin = (header: string | undefined) =>
  readToken(readCookie(header, SESSION_COOKIE));

/**
 * Garde de toutes les routes d'administration.
 *
 * Le rôle est vérifié à la connexion, pas ici : le jeton n'est délivré qu'à un
 * compte ADMIN. Un compte rétrogradé garde donc l'accès jusqu'à l'expiration
 * de sa session — limite assumée du sans-état, voir lib/session.ts.
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const session = currentAdmin(req.headers.cookie);

  if (!session) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  req.admin = { userId: session.userId, email: session.email };
  next();
};
