/*
  Warnings:

  - You are about to drop the column `serialNumber` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assets" DROP COLUMN "serialNumber";

-- CreateTable
CREATE TABLE "asset_serial_numbers" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "asset_serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_serial_numbers_assetId_serialNumber_key" ON "asset_serial_numbers"("assetId", "serialNumber");

-- AddForeignKey
ALTER TABLE "asset_serial_numbers" ADD CONSTRAINT "asset_serial_numbers_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
