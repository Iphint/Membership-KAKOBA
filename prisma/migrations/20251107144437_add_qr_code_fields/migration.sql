-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "qr_code_token" TEXT,
ADD COLUMN     "qr_code_used" BOOLEAN NOT NULL DEFAULT false;
