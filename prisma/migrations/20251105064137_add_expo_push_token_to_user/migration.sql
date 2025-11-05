/*
  Warnings:

  - You are about to drop the column `expo_push_token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "expo_push_token",
ADD COLUMN     "expoPushToken" TEXT;
