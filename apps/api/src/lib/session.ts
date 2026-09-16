import { createHmac, timingSafeEqual } from "node:crypto";
import type { Response } from "express";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "velyna_admin";

type SessionPayload = { userId: number; email: string; exp: number };

const sign = (data: string) =>
  createHmac("sha256", env.SESSION_SECRET).update(data).digest("base64url");

/**
 * Jeton signé sans état : « <payload base64url>.<signature HMAC> ».
 *
 * Pas de table de sessions en base — donc pas de migration, et aucune requête
 * supplémentaire pour vérifier chaque appel. La contrepartie est qu'un jeton
 * ne peut pas être révoqué avant son expiration ; c'est acceptable pour un
 * back-office à quelques comptes avec des sessions de 12 h. Le jour où la
 * révocation devient nécessaire, une table `session` remplacera ce fichier
 * sans toucher aux routes.
 */
export const createToken = (userId: number, email: string) => {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Date.now() + env.SESSION_HOURS * 3600 * 1000,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
};

export const readToken = (token: string | undefined): SessionPayload | null => {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

/** Le cookie de session n'est jamais lisible en JavaScript : httpOnly, non négociable. */
export const setSessionCookie = (res: Response, token: string) => {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: env.SESSION_HOURS * 3600 * 1000,
    path: "/",
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  });
};
