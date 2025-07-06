/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Checkout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Movement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockLevel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Checkout" DROP CONSTRAINT "Checkout_assetId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceRecord" DROP CONSTRAINT "MaintenanceRecord_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_locationId_fkey";

-- DropForeignKey
ALTER TABLE "StockLevel" DROP CONSTRAINT "StockLevel_assetId_fkey";

-- DropForeignKey
ALTER TABLE "StockLevel" DROP CONSTRAINT "StockLevel_locationId_fkey";

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "Checkout";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "MaintenanceRecord";

-- DropTable
DROP TABLE "Movement";

-- DropTable
DROP TABLE "StockLevel";

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "categoryId" INTEGER NOT NULL,
    "modelBrand" TEXT,
    "serialNumber" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "lastMaintenance" TIMESTAMP(3),
    "warrantyExpiration" TIMESTAMP(3),
    "notes" TEXT,
    "assigned" TEXT,
    "assetNumber" TEXT,
    "supplier" TEXT,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkouts" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "checkoutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "performedBy" TEXT,
    "cost" DECIMAL(10,2),

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
