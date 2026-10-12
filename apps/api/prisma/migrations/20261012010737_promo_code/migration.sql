-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('PERCENT', 'AMOUNT', 'FREE_DELIVERY');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "promo_code_id" INTEGER;

-- CreateTable
CREATE TABLE "promo_code" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "value" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "min_sub_total" INTEGER,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "once_per_customer" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promo_code_code_key" ON "promo_code"("code");

-- CreateIndex
CREATE INDEX "order_promo_code_id_idx" ON "order"("promo_code_id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reprise du code historique, jusqu'ici codé en dur dans @velyna/shared :
-- sans cette ligne, VELYNA10 cesserait de fonctionner au déploiement.
INSERT INTO "promo_code" ("code", "label", "type", "value", "updated_at")
VALUES ('VELYNA10', 'Code de bienvenue', 'PERCENT', 10, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Rattache les commandes déjà passées avec VELYNA10, pour les statistiques.
UPDATE "order" o SET "promo_code_id" = p."id"
FROM "promo_code" p
WHERE o."promo_code" = p."code" AND o."promo_code_id" IS NULL;

UPDATE "promo_code" p SET "used_count" = (
  SELECT COUNT(*) FROM "order" o
  WHERE o."promo_code_id" = p."id" AND o."status" NOT IN ('CANCELLED', 'REFUNDED')
);
