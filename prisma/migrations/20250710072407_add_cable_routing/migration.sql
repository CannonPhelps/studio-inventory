-- CreateTable
CREATE TABLE "cable_routes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalLength" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cable_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cable_segments" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "fromRoomId" INTEGER NOT NULL,
    "toRoomId" INTEGER NOT NULL,
    "cableAssetId" INTEGER,
    "length" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "cable_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cable_segments_routeId_order_key" ON "cable_segments"("routeId", "order");

-- AddForeignKey
ALTER TABLE "cable_segments" ADD CONSTRAINT "cable_segments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "cable_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_segments" ADD CONSTRAINT "cable_segments_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_segments" ADD CONSTRAINT "cable_segments_toRoomId_fkey" FOREIGN KEY ("toRoomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cable_segments" ADD CONSTRAINT "cable_segments_cableAssetId_fkey" FOREIGN KEY ("cableAssetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
