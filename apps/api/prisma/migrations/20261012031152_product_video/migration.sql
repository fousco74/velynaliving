-- AlterTable
ALTER TABLE "product" ADD COLUMN     "video" TEXT;

-- Film du rituel, livré avec le front (apps/web/public/assets).
UPDATE "product" SET "video" = '/assets/matcha-rituel.mp4' WHERE "slug" = 'matcha-ceremonial';
