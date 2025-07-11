import { prisma } from '$lib/db';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EncryptionService } from './encryption';

export interface BackupMetadata {
  id: string;
  timestamp: string;
  version: string;
  tables: string[];
  recordCount: number;
  size: number;
  checksum: string;
  encrypted: boolean;
  description?: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, unknown[]>;
}

export class BackupService {
  private static backupDir = './backups';
  private static encryptionPassword = process.env.BACKUP_ENCRYPTION_PASSWORD || 'default-backup-password';

  // Map Prisma model names to actual database table names
  private static tableNameMap: Record<string, string> = {
    // Core inventory
    Category: 'categories',
    CableType: 'cable_types',
    CableEnd: 'cable_ends',
    BulkCable: 'bulk_cables',
    CableAssembly: 'cable_assemblies',
    Asset: 'assets',
    AssetSerialNumber: 'asset_serial_numbers',
    FinancialRecord: 'financial_records',
    // Operations
    Checkout: 'checkouts',
    MaintenanceRecord: 'maintenance_records',
    Movement: 'movements',
    // Auth
    User: '"User"', // quoted because Postgres treats mixed-case identifiers as case-sensitive
    UserKey: '"UserKey"',
    UserSession: '"UserSession"',
    // System logs / notifications
    AuditLog: 'audit_logs',
    Notification: 'notifications',
    // Rooms & cabling
    Room: 'rooms',
    CableRoute: 'cable_routes',
    CableSegment: 'cable_segments',
    // Automation
    AutomatedTask: 'automated_tasks',
    AutomatedTaskLog: 'automated_task_logs',
    // Projects & kits
    Project: 'projects',
    ProjectAsset: 'project_assets',
    ProjectTask: 'project_tasks',
    Kit: 'kits',
    KitAsset: 'kit_assets'
  };

  /**
   * Initialize backup directory
   */
  private static async ensureBackupDir(): Promise<void> {
    if (!existsSync(this.backupDir)) {
      await mkdir(this.backupDir, { recursive: true });
    }
  }

  /**
   * Generate backup filename that embeds the backupId so we can easily locate it later.
   */
  private static generateBackupFilename(backupId: string): string {
    return `backup-${backupId}.json`;
  }

  /**
   * Calculate checksum for data integrity
   */
  private static calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a full database backup
   */
  static async createBackup(description?: string): Promise<BackupMetadata> {
    try {
      await this.ensureBackupDir();

      const backupId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const version = '1.0.0';

      // Dynamically derive table list from the map keys (keeps backups in sync with schema)
      const tables = Object.keys(this.tableNameMap);

      const backupData: Record<string, unknown[]> = {};
      // Temporary collector for legacy serial numbers
      const legacySerials: { assetId: number; serialNumber: string }[] = [];
      let totalRecords = 0;

      // Backup each table
      for (const table of tables) {
        try {
          const tableName = this.tableNameMap[table] || table;
          const records = await prisma.$queryRawUnsafe(`SELECT * FROM ${tableName}`);
          // If we're processing Asset rows, capture legacy serialNumber column
          if (table === 'Asset') {
            for (const rec of records as Record<string, unknown>[]) {
              const sn = (rec as Record<string, unknown>)['serialNumber'] ?? (rec as Record<string, unknown>)['serial_number'];
              const id = (rec as Record<string, unknown>)['id'];
              if (sn) {
                legacySerials.push({ assetId: id as number, serialNumber: sn as string });
              }
            }
          }

          backupData[table] = records as unknown[];
          totalRecords += (records as unknown[]).length;
        } catch (error) {
          console.error(`Error backing up table ${table}:`, error);
          backupData[table] = [];
        }
      }

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        version,
        tables,
        recordCount: totalRecords,
        size: 0, // Will be calculated after serialization
        checksum: '',
        encrypted: true,
        description
      };

      // Include legacy serials if present and AssetSerialNumber already selected
      if (legacySerials.length > 0) {
        if (!backupData['AssetSerialNumber']) {
          backupData['AssetSerialNumber'] = [];
        }
        backupData['AssetSerialNumber'] = [
          ...backupData['AssetSerialNumber'] as unknown[],
          ...legacySerials
        ];
      }

      // Create backup object
      const backup: BackupData = {
        metadata,
        data: backupData
      };

      // Serialize and encrypt
      const jsonData = JSON.stringify(backup, null, 2);
      const encryptedData = EncryptionService.encrypt(jsonData, this.encryptionPassword);

      // Calculate final metadata
      metadata.size = Buffer.byteLength(encryptedData, 'utf8');
      metadata.checksum = this.calculateChecksum(jsonData);

      // Save backup file (include backupId in the filename for easy lookup)
      const filename = this.generateBackupFilename(backupId);
      const filepath = path.join(this.backupDir, filename);
      await writeFile(filepath, encryptedData, 'utf8');

      // Save metadata separately for quick access
      const metadataFilepath = path.join(this.backupDir, `${backupId}-metadata.json`);
      await writeFile(metadataFilepath, JSON.stringify(metadata, null, 2), 'utf8');

      console.log(`Backup created: ${filename} (${totalRecords} records)`);
      return metadata;

    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * List all available backups
   */
  static async listBackups(): Promise<BackupMetadata[]> {
    try {
      await this.ensureBackupDir();
      
      const { readdir } = await import('fs/promises');
      const files = await readdir(this.backupDir);
      
      const metadataFiles = files.filter(file => file.endsWith('-metadata.json'));
      const backups: BackupMetadata[] = [];

      for (const file of metadataFiles) {
        try {
          const filepath = path.join(this.backupDir, file);
          const content = await readFile(filepath, 'utf8');
          const metadata: BackupMetadata = JSON.parse(content);
          backups.push(metadata);
        } catch (error) {
          console.error(`Error reading metadata file ${file}:`, error);
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
      console.error('Failed to list backups:', error);
      throw new Error('Failed to list backups');
    }
  }

  /**
   * Restore database from backup
   */
  static async restoreBackup(backupId: string, options: { 
    dryRun?: boolean; 
    skipAuditLogs?: boolean;
    tables?: string[];
  } = {}): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
    try {
      const { dryRun = false, skipAuditLogs = true, tables } = options;

      // Find backup file
      const { readdir } = await import('fs/promises');
      const files = await readdir(this.backupDir);
      
      const backupFile = files.find(file => file.includes(backupId) && !file.endsWith('-metadata.json'));
      if (!backupFile) {
        throw new Error('Backup file not found');
      }

      // Read and decrypt backup
      const filepath = path.join(this.backupDir, backupFile);
      const encryptedData = await readFile(filepath, 'utf8');
      const jsonData = EncryptionService.decrypt(encryptedData, this.encryptionPassword);
      const backup: BackupData = JSON.parse(jsonData);

      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(JSON.stringify(backup.data));
      if (calculatedChecksum !== backup.metadata.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      if (dryRun) {
        return {
          success: true,
          message: 'Dry run completed successfully',
          details: {
            tables: backup.metadata.tables,
            recordCount: backup.metadata.recordCount,
            size: backup.metadata.size
          }
        };
      }

      // Begin transaction
      await prisma.$transaction(async (tx) => {
        // Clear existing data (except audit logs if requested)
        const tablesToRestore = tables || backup.metadata.tables;
        
        for (const table of tablesToRestore) {
          if (skipAuditLogs && table === 'AuditLog') continue;
          
          try {
            const tableName = this.tableNameMap[table] || table;
            await tx.$executeRawUnsafe(`DELETE FROM ${tableName}`);
            console.log(`Cleared table: ${table}`);
          } catch (error) {
            console.error(`Error clearing table ${table}:`, error);
          }
        }

        // Restore data
        for (const [table, records] of Object.entries(backup.data)) {
          if (tables && !tables.includes(table)) continue;
          if (skipAuditLogs && table === 'AuditLog') continue;

          if (records.length > 0) {
            try {
              const tableName = this.tableNameMap[table] || table;
              await tx.$executeRawUnsafe(
                 `INSERT INTO ${tableName} (${Object.keys(records[0] as Record<string, unknown>).join(', ')}) VALUES ${records.map(record => 
                   `(${Object.values(record as Record<string, unknown>).map(value => 
                     value === null ? 'NULL' : 
                     typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : 
                     value
                   ).join(', ')})`
                 ).join(', ')}`
               );
              console.log(`Restored ${records.length} records to ${table}`);
            } catch (error) {
              console.error(`Error restoring table ${table}:`, error);
              throw error;
            }
          }
        }
      });

      return {
        success: true,
        message: `Successfully restored backup ${backupId}`,
        details: {
          tables: tables || backup.metadata.tables,
          recordCount: backup.metadata.recordCount
        }
      };

    } catch (error) {
      console.error('Backup restoration failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Restoration failed'
      };
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const { readdir, unlink } = await import('fs/promises');
      const files = await readdir(this.backupDir);
      
      const backupFiles = files.filter(file => file.includes(backupId));
      
      for (const file of backupFiles) {
        const filepath = path.join(this.backupDir, file);
        await unlink(filepath);
      }

      console.log(`Deleted backup: ${backupId}`);
      return true;

    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: string | null;
    newestBackup: string | null;
    averageSize: number;
  }> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          oldestBackup: null,
          newestBackup: null,
          averageSize: 0
        };
      }

      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
      const timestamps = backups.map(b => b.timestamp).sort();

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: timestamps[0],
        newestBackup: timestamps[timestamps.length - 1],
        averageSize: Math.round(totalSize / backups.length)
      };

    } catch (error) {
      console.error('Failed to get backup stats:', error);
      throw new Error('Failed to get backup statistics');
    }
  }
} 