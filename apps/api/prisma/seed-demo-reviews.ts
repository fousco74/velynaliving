import { splitFullName } from "@velyna/shared";
import { env } from "../src/config/env.js";
import { disconnect, prisma } from "../src/db.js";

/**
 * Avis de démonstration, pour voir les fiches produit comme en vrai.
 *
 *   pnpm --filter @velyna/api reviews:demo
 *
 * **Base locale uniquement** : le script refuse toute autre base. Publier de
 * faux avis sur le site réel serait une pratique commerciale trompeuse — c'est
 * aussi pour cela qu'il n'est pas appelé par `db:seed`, qui sert en production.
 *
 * Il remplace TOUS les avis de la base locale : il est rejouable à volonté.
 * Les avis « Achat vérifié » s'appuient sur les commandes de démonstration
 * (VL-2026-0001 à 0004) ; sans elles, ils sont créés sans badge.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "postgres"]);

type DemoReview = {
  product: string;
  name: string;
  email: string;
  rating: number;
  body: string;
  date: string;
  reply?: string;
  status?: "APPROVED" | "PENDING" | "REJECTED";
};

const REVIEWS: DemoReview[] = [
  {
    product: "matcha-ceremonial",
    name: "Fanta Diallo",
    email: "fanta.diallo@example.ci",
    rating: 5,
    date: "2026-10-04",
    body: "Un matcha d'une belle couleur, très doux, sans amertume. Je le prends le matin avec du lait d'avoine, c'est devenu mon petit rituel avant le travail.",
    reply: "Merci Fanta ! Le lait d'avoine lui va très bien, c'est aussi notre préféré.",
  },
  {
    product: "matcha-ceremonial",
    name: "Mariam Ouattara",
    email: "mariam.ouattara@example.ci",
    rating: 4,
    date: "2026-09-27",
    body: "Très bon goût et bien emballé. Il faut juste prendre le coup de main avec le fouet, les premières tasses avaient quelques grumeaux.",
  },
  {
    product: "matcha-ceremonial",
    name: "Jean-Marc Yao",
    email: "jm.yao@example.ci",
    rating: 5,
    date: "2026-09-15",
    body: "Offert à ma femme, elle ne boit plus que ça le week-end. Livraison rapide à Cocody.",
  },
  {
    product: "santal-atelier",
    name: "Awa Koné",
    email: "awa.kone@example.ci",
    rating: 5,
    date: "2026-10-02",
    body: "Une odeur boisée chaude, élégante, jamais entêtante. Deux pulvérisations dans le salon et toute la pièce change d'ambiance. Le flacon est superbe.",
  },
  {
    product: "santal-atelier",
    name: "Kevin N'Guessan",
    email: "kevin.nguessan@example.ci",
    rating: 4,
    date: "2026-09-18",
    body: "Très beau parfum, je l'utilise dans mon bureau. Il tient bien toute la matinée, un peu moins l'après-midi avec la climatisation.",
  },
  {
    product: "maison-riviera",
    name: "Serge Kouamé",
    email: "serge.kouame@example.ci",
    rating: 5,
    date: "2026-10-06",
    body: "Frais et lumineux, parfait pour la terrasse le soir. Mes invités m'ont tous demandé ce que c'était.",
  },
  {
    product: "maison-riviera",
    name: "Christelle Aka",
    email: "christelle.aka@example.ci",
    rating: 3,
    date: "2026-09-22",
    body: "L'odeur est agréable mais un peu légère à mon goût pour une grande pièce. Je le garde pour la chambre d'amis.",
    reply:
      "Merci Christelle pour ce retour honnête. Pour une grande pièce, Velours d'Ambre a plus de tenue : n'hésitez pas à nous écrire, nous vous conseillerons volontiers.",
  },
  {
    product: "fleur-de-lin",
    name: "Ismaël Traoré",
    email: "ismael.traore@example.ci",
    rating: 5,
    date: "2026-10-08",
    body: "Exactement l'odeur du linge propre. Je le vaporise sur les draps avant de dormir, c'est très apaisant.",
  },
  {
    product: "fleur-de-lin",
    name: "Aïcha Coulibaly",
    email: "aicha.coulibaly@example.ci",
    rating: 4,
    date: "2026-09-12",
    body: "Une fraîcheur discrète et propre, idéale pour la salle de bain. J'aurais aimé un format voyage.",
  },
  {
    product: "velours-dambre",
    name: "Ismaël Traoré",
    email: "ismael.traore@example.ci",
    rating: 5,
    date: "2026-10-09",
    body: "Chaud, enveloppant, très chic. Mon préféré de la collection pour les soirées.",
  },
  {
    product: "velours-dambre",
    name: "Nadège Brou",
    email: "nadege.brou@example.ci",
    rating: 4,
    date: "2026-09-30",
    body: "Un ambre profond et raffiné. Assez puissant : une seule pulvérisation suffit largement.",
  },
  {
    product: "minuit-poudre",
    name: "Laetitia Gnagne",
    email: "laetitia.gnagne@example.ci",
    rating: 5,
    date: "2026-10-01",
    body: "Une odeur poudrée tout en douceur, parfaite pour la chambre. On a l'impression d'être dans un hôtel de luxe.",
  },
  {
    product: "minuit-poudre",
    name: "Didier Konan",
    email: "didier.konan@example.ci",
    rating: 4,
    date: "2026-09-08",
    body: "Très agréable et délicat. Le prix est un peu élevé mais la qualité est là.",
  },
  // En attente : pour voir la file de modération du back-office.
  {
    product: "matcha-ceremonial",
    name: "Rokia Sanogo",
    email: "rokia.sanogo@example.ci",
    rating: 5,
    date: "2026-10-11",
    body: "Reçu hier, déjà conquise ! Est-ce que vous proposerez un coffret avec le fouet ?",
    status: "PENDING",
  },
];

const main = async () => {
  const host = new URL(env.DATABASE_URL).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    console.error(`Refusé : la base « ${host} » n'est pas locale. Ces avis sont fictifs.`);
    process.exitCode = 1;
    return;
  }

  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  const productId = new Map(products.map((product) => [product.slug, product.id]));

  await prisma.review.deleteMany();

  let created = 0;
  let verified = 0;

  for (const review of REVIEWS) {
    const id = productId.get(review.product);
    if (!id) {
      console.warn(`Produit absent, avis ignoré : ${review.product}`);
      continue;
    }

    const order = await prisma.order.findFirst({
      where: { email: review.email, items: { some: { productId: id } } },
      select: { id: true },
    });

    const status = review.status ?? "APPROVED";
    // Midi UTC, comme partout ailleurs : minuit afficherait la veille à l'ouest.
    const date = new Date(`${review.date}T12:00:00Z`);

    await prisma.review.create({
      data: {
        productId: id,
        ...splitFullName(review.name),
        email: review.email,
        rating: review.rating,
        body: review.body,
        status,
        verified: order !== null,
        orderId: order?.id ?? null,
        reply: review.reply ?? null,
        repliedAt: review.reply ? date : null,
        publishedAt: status === "APPROVED" ? date : null,
        createdAt: date,
      },
    });

    created += 1;
    if (order) verified += 1;
  }

  console.log(`${created} avis de démonstration, dont ${verified} « Achat vérifié ».`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(disconnect);
