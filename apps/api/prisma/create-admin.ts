import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { disconnect, prisma } from "../src/db.js";
import { hashPassword } from "../src/lib/password.js";

/**
 * Création d'un compte administrateur.
 *
 *   pnpm admin:create                          → mode interactif
 *   pnpm admin:create contact@velyna.ci secret → mode direct
 *
 * Volontairement hors du seed : un mot de passe ne doit pas vivre dans un
 * fichier versionné, et le seed est rejoué à chaque remise à zéro de la base.
 */
const main = async () => {
  const [emailArg, passwordArg] = process.argv.slice(2);

  let email = emailArg;
  let password = passwordArg;

  if (!email || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    email ||= await rl.question("E-mail administrateur : ");
    password ||= await rl.question("Mot de passe : ");
    rl.close();
  }

  email = email.trim().toLowerCase();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("E-mail invalide.");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("Mot de passe trop court : 10 caractères minimum.");
    process.exit(1);
  }

  const hashed = await hashPassword(password);

  // Idempotent : relancer la commande réinitialise le mot de passe du compte.
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, password: hashed, role: "ADMIN" },
    update: { password: hashed, role: "ADMIN" },
    select: { email: true, role: true, createdAt: true, updatedAt: true },
  });

  const created = user.createdAt.getTime() === user.updatedAt.getTime();
  console.log(
    `${created ? "Compte créé" : "Mot de passe réinitialisé"} : ${user.email} (${user.role})`,
  );
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(disconnect);
