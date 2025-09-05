/*
  Warnings:

  - Added the required column `messateType` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('MESSAGE', 'PAYMENT', 'LOCATION', 'FRIEND_REQUEST', 'JOIN_NEW_GROUP', 'LEAVE_GROUP');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "messateType" "MessageType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "walletAddress" TEXT;
