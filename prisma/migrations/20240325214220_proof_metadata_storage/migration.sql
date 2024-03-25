-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "queryComparator" TEXT NOT NULL,
    "queryValue" TEXT NOT NULL,
    "queryResult" TEXT NOT NULL,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);
