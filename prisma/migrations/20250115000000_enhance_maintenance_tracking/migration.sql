-- Enhance maintenance tracking system
-- Add new fields to maintenance_records table
ALTER TABLE "maintenance_records" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SCHEDULED';
ALTER TABLE "maintenance_records" ADD COLUMN "maintenanceType" TEXT;
ALTER TABLE "maintenance_records" ADD COLUMN "scheduledDate" TIMESTAMP(3);
ALTER TABLE "maintenance_records" ADD COLUMN "completedDate" TIMESTAMP(3);
ALTER TABLE "maintenance_records" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

-- Create maintenance_updates table
CREATE TABLE "maintenance_updates" (
    "id" SERIAL PRIMARY KEY,
    "maintenanceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("maintenanceId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX "maintenance_updates_maintenanceId_idx" ON "maintenance_updates"("maintenanceId");
CREATE INDEX "maintenance_records_status_idx" ON "maintenance_records"("status");
CREATE INDEX "maintenance_records_assetId_idx" ON "maintenance_records"("assetId"); 