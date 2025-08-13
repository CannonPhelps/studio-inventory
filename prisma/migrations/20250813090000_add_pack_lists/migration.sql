-- CreateTable
CREATE TABLE "pack_lists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromKitId" INTEGER,

    CONSTRAINT "pack_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_list_items" (
    "id" SERIAL NOT NULL,
    "packListId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "quantityRequested" INTEGER NOT NULL,
    "quantityPacked" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "pack_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pack_list_items_packListId_assetId_key" ON "pack_list_items"("packListId", "assetId");

-- AddForeignKey
ALTER TABLE "pack_lists" ADD CONSTRAINT "pack_lists_fromKitId_fkey" FOREIGN KEY ("fromKitId") REFERENCES "kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_list_items" ADD CONSTRAINT "pack_list_items_packListId_fkey" FOREIGN KEY ("packListId") REFERENCES "pack_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_list_items" ADD CONSTRAINT "pack_list_items_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


