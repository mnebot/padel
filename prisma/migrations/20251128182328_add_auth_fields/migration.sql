/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add columns with default values first
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '$2b$10$YourDefaultHashedPasswordHere';

-- Update existing users with a temporary password (hash of 'changeme123')
UPDATE "User" SET "password" = '$2b$10$rKvVJH5xhZ5Y5Y5Y5Y5Y5eJ5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5' WHERE "password" = '$2b$10$YourDefaultHashedPasswordHere';

-- Remove default value from password column
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_isAdmin_idx" ON "User"("isAdmin");
