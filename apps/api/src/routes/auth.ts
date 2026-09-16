import express from "express";
import { loginSchema } from "@velyna/shared";
import { prisma } from "../db.js";
import { verifyPassword } from "../lib/password.js";
import { clearSessionCookie, createToken, setSessionCookie } from "../lib/session.js";
import { requireAdmin } from "../middleware/auth.js";

export const authRouter = express.Router();

/** Empreinte factice : coût de vérification identique que le compte existe ou non. */
const DUMMY_HASH = "scrypt$00000000000000000000000000000000$" + "0".repeat(128);

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Identifiants invalides.", issues: parsed.error.issues });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, email: true, password: true, role: true },
  });

  // On vérifie le mot de passe même sans compte trouvé : sans cela, le temps
  // de réponse révèle quelles adresses existent en base.
  const valid = await verifyPassword(parsed.data.password, user?.password ?? DUMMY_HASH);

  if (!user || !valid || user.role !== "ADMIN") {
    return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
  }

  setSessionCookie(res, createToken(user.id, user.email));

  res.json({ data: { email: user.email, role: user.role } });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ data: { ok: true } });
});

/** Consulté au chargement du back-office pour savoir s'il faut rediriger vers /admin/login. */
authRouter.get("/me", requireAdmin, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.admin!.userId },
    select: { email: true, role: true },
  });

  // Compte supprimé ou rétrogradé depuis l'émission du jeton : on ferme la session.
  if (!user || user.role !== "ADMIN") {
    clearSessionCookie(res);
    return res.status(401).json({ error: "Authentification requise." });
  }

  res.json({ data: user });
});
