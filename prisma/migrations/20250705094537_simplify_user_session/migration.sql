/*
  Warnings:

  - You are about to drop the column `activeExpires` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `idleExpires` on the `UserSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "activeExpires",
DROP COLUMN "idleExpires";

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
