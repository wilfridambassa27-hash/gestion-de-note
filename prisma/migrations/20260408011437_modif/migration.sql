/*
  Warnings:

  - You are about to drop the column `notificationsEnvoyees` on the `Bulletin` table. All the data in the column will be lost.
  - You are about to drop the column `effectif` on the `Classe` table. All the data in the column will be lost.
  - You are about to drop the column `bulletinId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `evaluationId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `etudiantId` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[etudiantId,matiereId,semestreId,typenote]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typenote` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Made the column `bulletinId` on table `QRCode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_matiereId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_semestreId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_bulletinId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_etudiantId_fkey";

-- DropIndex
DROP INDEX "Note_etudiantId_evaluationId_key";

-- DropIndex
DROP INDEX "Note_evaluationId_idx";

-- AlterTable
ALTER TABLE "Bulletin" DROP COLUMN "notificationsEnvoyees";

-- AlterTable
ALTER TABLE "Classe" DROP COLUMN "effectif";

-- AlterTable
ALTER TABLE "ClasseMatiere" ADD COLUMN     "coefficient" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Matiere" ADD COLUMN     "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "bulletinId",
DROP COLUMN "evaluationId",
ADD COLUMN     "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "typenote" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QRCode" DROP COLUMN "etudiantId",
ALTER COLUMN "bulletinId" SET NOT NULL;

-- DropTable
DROP TABLE "Evaluation";

-- DropTable
DROP TABLE "Notification";

-- CreateIndex
CREATE INDEX "Note_etudiantId_matiereId_idx" ON "Note"("etudiantId", "matiereId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_etudiantId_matiereId_semestreId_typenote_key" ON "Note"("etudiantId", "matiereId", "semestreId", "typenote");
