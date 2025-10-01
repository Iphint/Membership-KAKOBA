/*
  Warnings:

  - You are about to drop the column `name_product_transaction` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `price_product_transaction` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_product_transaction` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "name_product_transaction",
DROP COLUMN "price_product_transaction",
DROP COLUMN "quantity_product_transaction";

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "name_product_transaction" TEXT NOT NULL,
    "price_product_transaction" INTEGER NOT NULL,
    "quantity_product_transaction" INTEGER NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
