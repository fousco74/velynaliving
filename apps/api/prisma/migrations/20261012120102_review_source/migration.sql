-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('SITE', 'ADMIN');

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "source" "ReviewSource" NOT NULL DEFAULT 'SITE';
