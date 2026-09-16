import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * scrypt plutôt que bcrypt : c'est une KDF à coût mémoire, recommandée par
 * l'OWASP, et elle est dans le cœur de Node — pas de dépendance native à
 * recompiler au déploiement, un souci de moins sur un hébergeur mutualisé.
 *
 * Format stocké : « scrypt$<sel hex>$<empreinte hex> ». Le préfixe permettra
 * de migrer vers un autre algorithme sans casser les comptes existants.
 */
export const hashPassword = async (password: string) => {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [scheme, saltHex, hashHex] = stored.split("$");

  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);

  // Comparaison à temps constant : une comparaison naïve fuite la longueur
  // du préfixe correct et ouvre une attaque temporelle.
  return timingSafeEqual(derived, expected);
};
