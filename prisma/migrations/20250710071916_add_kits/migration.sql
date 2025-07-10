-- CreateTable
CREATE TABLE "kits" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_assets" (
    "id" SERIAL NOT NULL,
    "kitId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "quantity" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "kit_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kit_assets_kitId_assetId_key" ON "kit_assets"("kitId", "assetId");

-- AddForeignKey
ALTER TABLE "kit_assets" ADD CONSTRAINT "kit_assets_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_assets" ADD CONSTRAINT "kit_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
