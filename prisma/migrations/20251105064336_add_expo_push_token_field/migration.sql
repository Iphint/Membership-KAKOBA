/*
  Warnings:

  - You are about to drop the column `expoPushToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "expoPushToken",
ADD COLUMN     "expo_push_token" TEXT;
