import { prisma } from "../src/db.js";
import { articles, seedJournal } from "./seed-journal.js";

// Données relevées dans le design (docs/seed-data.md).
// Les chemins d'images sont normalisés ici : le front sert apps/web/public/assets/.

const houses = [
  { name: "Maison Velyná", slug: "maison-velyna" },
  { name: "Velynákaï", slug: "velyna-kai" },
];

const products = [
  {
    slug: "santal-atelier",
    name: "Santal Atelier",
    ref: "MV-SA-250",
    houseSlug: "maison-velyna",
    price: 29900,
    capacity: "250 ml",
    stock: 42,
    newRank: 3,
    img: "/assets/santal-atelier.jpeg",
    imgDetail: null,
    detailBackground: null,
    inkColor: null,
    headNote: "Bergamote, cardamome, cuir",
    heartNote: "Bois de santal, iris, violette",
    backgroundNote: "Cèdre, ambre, papyrus",
    piece: "Toute la maison",
    usage:
      "Une composition intemporelle qui trouve naturellement sa place dans toute la maison. Ses notes boisées et sophistiquées apportent une sensation de calme, d'élégance et de caractère.",
    ambiance: "L'atelier d'un artiste au petit matin",
    description:
      "Un santal crémeux adouci d'un cuir presque tendre, relevé d'un poivre rose qui claque à l'ouverture. La fragrance s'installe lentement, comme une matière que l'on travaille à la main, et laisse derrière elle une chaleur boisée qui tient toute la journée.",
    status: "ONLINE" as const,
  },
  {
    slug: "maison-riviera",
    name: "Maison Riviera",
    ref: "MV-MR-250",
    houseSlug: "maison-velyna",
    price: 29900,
    capacity: "250 ml",
    stock: 28,
    newRank: 2,
    img: "/assets/maison-riviera.jpeg",
    imgDetail: null,
    detailBackground: null,
    inkColor: null,
    headNote: "Citron vert, agrumes, pamplemousse",
    heartNote: "Basilic, rose, cassis, thym",
    backgroundNote: "Patchouli, réglisse, ambre gris",
    piece: "La cuisine",
    usage:
      "Une fragrance fraîche et légère, idéale pour la cuisine. Sa diffusion plus aérienne accompagne parfaitement les moments après préparation des repas en apportant une sensation de fraîcheur.",
    ambiance: "Une terrasse méditerranéenne en fin de journée",
    description:
      "L'écorce fraîche des agrumes rencontre la chair laiteuse de la figue. Le jasmin apporte une rondeur solaire, le bois flotté une salinité discrète. Une brise entre dans la pièce et n'en repart plus.",
    status: "ONLINE" as const,
  },
  {
    slug: "fleur-de-lin",
    name: "Fleur de Lin",
    ref: "MV-FL-250",
    houseSlug: "maison-velyna",
    price: 29900,
    capacity: "250 ml",
    stock: 6,
    newRank: 5,
    img: "/assets/fleur-de-lin.jpeg",
    imgDetail: null,
    detailBackground: null,
    inkColor: null,
    headNote: "Bergamote, mandarine",
    heartNote: "Citron, fleur d'oranger",
    backgroundNote: "Cèdre, vétiver",
    piece: "Le linge et les textiles",
    usage:
      "La signature de la fraîcheur délicate. Pensée pour le linge et les textiles de la maison, elle sublime la literie, les oreillers, les rideaux, les serviettes, les canapés, les tapis ou encore les petits détails du quotidien.",
    ambiance: "Du linge frais séchant à la fenêtre",
    description:
      "La propreté comme un luxe. Des aldéhydes pétillants, un cœur de coton et de muguet, puis un musc blanc transparent qui prolonge la sensation de linge séché au vent. Le parfum des chambres claires et des dimanches lents.",
    status: "ONLINE" as const,
  },
  {
    slug: "velours-dambre",
    name: "Velours d'Ambre",
    ref: "MV-VA-250",
    houseSlug: "maison-velyna",
    price: 29900,
    capacity: "250 ml",
    stock: 35,
    newRank: 1,
    img: "/assets/velours-dambre.jpeg",
    imgDetail: null,
    detailBackground: null,
    inkColor: null,
    headNote: "Agrumes, pamplemousse rond, pêche, tubéreuse",
    heartNote: "Rose, osmanthe, jasmin, muguet",
    backgroundNote: "Patchouli, musc, cèdre, ambre gris",
    piece: "Le salon et les espaces de vie",
    usage:
      "Une fragrance enveloppante et chaleureuse, pensée comme une véritable empreinte pour toute la maison. Sa tenue remarquable lui permet de diffuser longtemps son aura élégante, créant une atmosphère raffinée et réconfortante du salon aux espaces de vie.",
    ambiance: "Un salon feutré, une soirée d'hiver",
    description:
      "Des résines chaudes enveloppées de vanille sombre et de fève tonka. La cardamome empêche la douceur de devenir sucrée. Le sillage le plus profond de la maison, celui que l'on garde pour les soirées où l'on reçoit.",
    status: "ONLINE" as const,
  },
  {
    slug: "minuit-poudre",
    name: "Minuit Poudré",
    ref: "MV-MP-250",
    houseSlug: "maison-velyna",
    price: 29900,
    capacity: "250 ml",
    stock: 0,
    newRank: 4,
    img: "/assets/minuit-poudre.jpeg",
    imgDetail: null,
    detailBackground: null,
    inkColor: null,
    headNote: "Citron vert, orange, pamplemousse",
    heartNote: "Poivre, violette, cannelle",
    backgroundNote: "Patchouli, cèdre, musc blanc",
    piece: "Les chambres",
    usage:
      "Un parfum délicat autour du musc, imaginé pour les espaces où l'on recherche douceur et apaisement. Il accompagne merveilleusement les chambres parentales, les chambres d'invités ou les espaces des enfants.",
    ambiance: "Le silence élégant d'une chambre à minuit",
    description:
      "L'iris poudré, sensuel et retenu, posé sur un santal crémeux. Une féminité adulte qui ne se raconte pas : elle se remarque quand on quitte la pièce.",
    status: "ONLINE" as const,
  },
  {
    slug: "matcha-ceremonial",
    name: "Matcha Latte",
    ref: "VK-MC-050",
    houseSlug: "velyna-kai",
    price: 25000,
    capacity: "50 g",
    stock: 61,
    newRank: 6,
    img: "/assets/velyna-kai.jpeg",
    imgDetail: "/assets/velynakai-produit.jpeg",
    detailBackground: "#7C8446",
    inkColor: "#F4F5E8",
    headNote: "Attaque végétale, herbe fraîche",
    heartNote: "Umami dense, noisette",
    backgroundNote: "Douceur lactée, longueur sucrée",
    piece: "Le rituel du matin",
    usage: null,
    ambiance: "Un instant suspendu, mesuré au geste près",
    description:
      "Feuilles de première récolte ombrées trois semaines avant la cueillette, puis broyées lentement à la meule de pierre. Une poudre vert jade, dense, sans amertume sèche, qui monte en mousse fine et tient longtemps en bouche.",
    status: "ONLINE" as const,
  },
];

for (const house of houses) {
  // upsert et non create : le seed doit pouvoir être rejoué autant de fois que nécessaire.
  await prisma.house.upsert({ where: { slug: house.slug }, create: house, update: house });
}

for (const { houseSlug, ...product } of products) {
  // connect par slug : évite d'aller chercher l'id de la maison au préalable.
  const data = { ...product, house: { connect: { slug: houseSlug } } };
  await prisma.product.upsert({ where: { slug: product.slug }, create: data, update: data });
}

// Le journal vient du même seed : au déploiement, `db:seed` suffit.
const journalCreated = await seedJournal();

console.log(
  `Seed terminé : ${houses.length} maisons, ${products.length} produits, ` +
    `${journalCreated} article(s) de journal créé(s) sur ${articles.length}.`,
);

await prisma.$disconnect();
