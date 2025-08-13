-- AlterTable: pack_lists add PNL fields
ALTER TABLE "pack_lists"
  ADD COLUMN "referenceCode" TEXT,
  ADD COLUMN "destination" TEXT,
  ADD COLUMN "dueAt" TIMESTAMP(3),
  ADD COLUMN "checkedOutAt" TIMESTAMP(3),
  ADD COLUMN "returnedAt" TIMESTAMP(3),
  ADD COLUMN "packedBy" TEXT,
  ADD COLUMN "checkedBy" TEXT,
  ADD COLUMN "notes" TEXT;

-- Unique index for referenceCode
CREATE UNIQUE INDEX IF NOT EXISTS "pack_lists_referenceCode_key" ON "pack_lists"("referenceCode");

-- AlterTable: pack_list_items add substitute & serials
ALTER TABLE "pack_list_items"
  ADD COLUMN "substituteAssetId" INTEGER,
  ADD COLUMN "serialNumbers" JSONB;

-- AddForeignKey for substitute asset
ALTER TABLE "pack_list_items" ADD CONSTRAINT "pack_list_items_substituteAssetId_fkey" FOREIGN KEY ("substituteAssetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;


