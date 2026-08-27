-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topRisks" TEXT[],
    "preparedness" JSONB NOT NULL,
    "barrier" TEXT NOT NULL,
    "barrierOther" TEXT,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);
