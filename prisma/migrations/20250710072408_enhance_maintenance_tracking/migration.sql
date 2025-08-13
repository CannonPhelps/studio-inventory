-- Enhance maintenance tracking system
-- Add new fields to maintenance_records table (idempotent)
ALTER TABLE "maintenance_records" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'SCHEDULED';
ALTER TABLE "maintenance_records" ADD COLUMN IF NOT EXISTS "maintenanceType" TEXT;
ALTER TABLE "maintenance_records" ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP(3);
ALTER TABLE "maintenance_records" ADD COLUMN IF NOT EXISTS "completedDate" TIMESTAMP(3);
ALTER TABLE "maintenance_records" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

-- Create maintenance_updates table if missing
CREATE TABLE IF NOT EXISTS "maintenance_updates" (
    "id" SERIAL PRIMARY KEY,
    "maintenanceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("maintenanceId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE
);

-- Create indexes if missing
CREATE INDEX IF NOT EXISTS "maintenance_updates_maintenanceId_idx" ON "maintenance_updates"("maintenanceId");
CREATE INDEX IF NOT EXISTS "maintenance_records_status_idx" ON "maintenance_records"("status");
CREATE INDEX IF NOT EXISTS "maintenance_records_assetId_idx" ON "maintenance_records"("assetId");