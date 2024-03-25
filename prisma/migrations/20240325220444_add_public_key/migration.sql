/*
  Warnings:

  - You are about to drop the column `queryResult` on the `Proof` table. All the data in the column will be lost.
  - Added the required column `publicKey` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" DROP COLUMN "queryResult",
ADD COLUMN     "publicKey" TEXT NOT NULL;
