import { API_BASE_URL } from "@/lib/api";

/**
 * Relais des images téléversées, servies par l'API.
 *
 * Pourquoi ne pas pointer `<Image>` directement sur l'API :
 * l'optimiseur de Next va chercher l'image DEPUIS LE SERVEUR. Lui donner
 * l'adresse publique obligerait le conteneur web à ressortir sur l'internet
 * et à revenir par le reverse proxy — et tout casserait dès que le DNS public
 * n'est pas résolvable depuis le conteneur, ce qui arrive plus souvent qu'on
 * ne croit (réseau interne, DNS scindé, propagation en cours).
 *
 * En passant par ici, l'URL de l'image est relative : même origine, donc ni
 * CORS, ni `remotePatterns`, ni dérogation à la protection anti-SSRF de Next.
 * Le trajet API → web emprunte le réseau interne.
 */

/** Même jeu de caractères que les noms produits par l'API (lib/uploads.ts). */
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;

  // Un seul segment, sans remontée de chemin possible.
  if (path.length !== 1 || !path[0] || !SAFE_NAME.test(path[0]) || path[0].startsWith(".")) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(`${API_BASE_URL}/uploads/${path[0]}`, { cache: "no-store" }).catch(
    () => null,
  );

  if (!upstream?.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      // Le nom porte un suffixe aléatoire : une URL désigne toujours les mêmes
      // octets, on peut la mettre en cache sans limite.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
