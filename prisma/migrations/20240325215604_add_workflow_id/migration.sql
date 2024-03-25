/*
  Warnings:

  - Added the required column `workflowId` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "workflowId" TEXT NOT NULL;
