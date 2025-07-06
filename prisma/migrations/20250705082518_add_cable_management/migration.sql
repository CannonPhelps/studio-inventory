-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "cableLength" INTEGER,
ADD COLUMN     "cableTypeId" INTEGER,
ADD COLUMN     "isCable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "cable_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "gauge" TEXT,
    "impedance" TEXT,
    "maxLength" INTEGER,

    CONSTRAINT "cable_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cable_ends" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,

    CONSTRAINT "cable_ends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_cables" (
    "id" SERIAL NOT NULL,
    "cableTypeId" INTEGER NOT NULL,
    "totalLength" INTEGER NOT NULL,
    "remainingLength" INTEGER NOT NULL,
    "location" TEXT,
    "supplier" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "bulk_cables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cable_assemblies" (
    "id" SERIAL NOT NULL,
    "cableTypeId" INTEGER NOT NULL,
    "endAId" INTEGER NOT NULL,
    "endBId" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "customName" TEXT,
    "assetId" INTEGER,

    CONSTRAINT "cable_assemblies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cable_types_name_key" ON "cable_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cable_ends_name_key" ON "cable_ends"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cable_assemblies_assetId_key" ON "cable_assemblies"("assetId");

-- AddForeignKey
ALTER TABLE "bulk_cables" ADD CONSTRAINT "bulk_cables_cableTypeId_fkey" FOREIGN KEY ("cableTypeId") REFERENCES "cable_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_assemblies" ADD CONSTRAINT "cable_assemblies_cableTypeId_fkey" FOREIGN KEY ("cableTypeId") REFERENCES "cable_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_assemblies" ADD CONSTRAINT "cable_assemblies_endAId_fkey" FOREIGN KEY ("endAId") REFERENCES "cable_ends"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_assemblies" ADD CONSTRAINT "cable_assemblies_endBId_fkey" FOREIGN KEY ("endBId") REFERENCES "cable_ends"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_assemblies" ADD CONSTRAINT "cable_assemblies_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_cableTypeId_fkey" FOREIGN KEY ("cableTypeId") REFERENCES "cable_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
