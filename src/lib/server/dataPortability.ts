import { prisma } from '$lib/db';
import { EncryptionService } from './encryption';

export interface ExportOptions {
  includeAssets: boolean;
  includeCategories: boolean;
  includeUsers: boolean;
  includeCheckouts: boolean;
  includeMaintenance: boolean;
  includeMovements: boolean;
  includeAuditLogs: boolean;
  includeNotifications: boolean;
  format: 'json' | 'csv' | 'xlsx';
  encrypt: boolean;
  password?: string;
}

export interface ImportOptions {
  validateOnly: boolean;
  skipDuplicates: boolean;
  updateExisting: boolean;
  importMode: 'append' | 'replace' | 'merge';
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errors: string[];
  warnings: string[];
}

export interface ExportResult {
  success: boolean;
  data: any;
  filename: string;
  size: number;
  format: string;
}

export class DataPortabilityService {
  /**
   * Export data based on options
   */
  static async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const exportData: any = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          options
        },
        data: {}
      };

      // Export assets
      if (options.includeAssets) {
        const assets = await prisma.asset.findMany({
          include: {
            category: true,
            serialNumbers: true,
            cableType: true
          }
        });
        exportData.data.assets = assets;
      }

      // Export categories
      if (options.includeCategories) {
        const categories = await prisma.category.findMany();
        exportData.data.categories = categories;
      }

      // Export users
      if (options.includeUsers) {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            department: true,
            phone: true,
            createdAt: true,
            updatedAt: true
          }
        });
        exportData.data.users = users;
      }

      // Export checkouts
      if (options.includeCheckouts) {
        const checkouts = await prisma.checkout.findMany({
          include: {
            asset: {
              select: {
                id: true,
                itemName: true
              }
            }
          }
        });
        exportData.data.checkouts = checkouts;
      }

      // Export maintenance records
      if (options.includeMaintenance) {
        const maintenance = await prisma.maintenanceRecord.findMany({
          include: {
            asset: {
              select: {
                id: true,
                itemName: true
              }
            }
          }
        });
        exportData.data.maintenance = maintenance;
      }

      // Export movements
      if (options.includeMovements) {
        const movements = await prisma.movement.findMany({
          include: {
            asset: {
              select: {
                id: true,
                itemName: true
              }
            }
          }
        });
        exportData.data.movements = movements;
      }

      // Export audit logs
      if (options.includeAuditLogs) {
        const auditLogs = await prisma.auditLog.findMany({
          orderBy: { timestamp: 'desc' },
          take: 1000 // Limit to recent logs
        });
        exportData.data.auditLogs = auditLogs;
      }

      // Export notifications
      if (options.includeNotifications) {
        const notifications = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000 // Limit to recent notifications
        });
        exportData.data.notifications = notifications;
      }

      let finalData = exportData;
      let filename = `studio-inventory-export-${new Date().toISOString().split('T')[0]}`;

      // Encrypt if requested
      if (options.encrypt && options.password) {
        const encryptedData = await EncryptionService.encryptObject(exportData, options.password);
        finalData = { encrypted: true, data: encryptedData };
        filename += '-encrypted';
      }

      // Format data
      switch (options.format) {
        case 'json':
          finalData = JSON.stringify(finalData, null, 2);
          filename += '.json';
          break;
        case 'csv':
          finalData = this.convertToCSV(exportData.data);
          filename += '.csv';
          break;
        case 'xlsx':
          finalData = await this.convertToXLSX(exportData.data);
          filename += '.xlsx';
          break;
      }

      return {
        success: true,
        data: finalData,
        filename,
        size: typeof finalData === 'string' ? finalData.length : JSON.stringify(finalData).length,
        format: options.format
      };
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data from various formats
   */
  static async importData(
    data: any,
    options: ImportOptions,
    format: 'json' | 'csv' | 'xlsx'
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errors: [],
        warnings: []
      };

      let parsedData: any;

      // Parse data based on format
      switch (format) {
        case 'json':
          parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          break;
        case 'csv':
          parsedData = this.parseCSV(data);
          break;
        case 'xlsx':
          parsedData = await this.parseXLSX(data);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Handle encrypted data
      if (parsedData.encrypted) {
        // This would require password input from user
        throw new Error('Encrypted imports not yet implemented');
      }

      const importData = parsedData.data || parsedData;

      // Import categories first (if they exist)
      if (importData.categories && options.importMode !== 'replace') {
        const categoryResult = await this.importCategories(importData.categories, options);
        result.totalRecords += categoryResult.totalRecords;
        result.importedRecords += categoryResult.importedRecords;
        result.skippedRecords += categoryResult.skippedRecords;
        result.errors.push(...categoryResult.errors);
        result.warnings.push(...categoryResult.warnings);
      }

      // Import assets
      if (importData.assets) {
        const assetResult = await this.importAssets(importData.assets, options);
        result.totalRecords += assetResult.totalRecords;
        result.importedRecords += assetResult.importedRecords;
        result.skippedRecords += assetResult.skippedRecords;
        result.errors.push(...assetResult.errors);
        result.warnings.push(...assetResult.warnings);
      }

      // Import users
      if (importData.users) {
        const userResult = await this.importUsers(importData.users, options);
        result.totalRecords += userResult.totalRecords;
        result.importedRecords += userResult.importedRecords;
        result.skippedRecords += userResult.skippedRecords;
        result.errors.push(...userResult.errors);
        result.warnings.push(...userResult.warnings);
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Unknown import error'],
        warnings: []
      };
    }
  }

  /**
   * Import categories
   */
  private static async importCategories(categories: any[], options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRecords: categories.length,
      importedRecords: 0,
      skippedRecords: 0,
      errors: [],
      warnings: []
    };

    for (const category of categories) {
      try {
        if (options.validateOnly) {
          // Just validate
          if (!category.name) {
            result.errors.push(`Category missing name: ${JSON.stringify(category)}`);
            continue;
          }
          result.importedRecords++;
        } else {
          // Check if category exists
          const existing = await prisma.category.findUnique({
            where: { name: category.name }
          });

          if (existing) {
            if (options.skipDuplicates) {
              result.skippedRecords++;
              continue;
            }
            if (options.updateExisting) {
              await prisma.category.update({
                where: { id: existing.id },
                data: {
                  description: category.description || existing.description
                }
              });
            }
          } else {
            await prisma.category.create({
              data: {
                name: category.name,
                description: category.description
              }
            });
          }
          result.importedRecords++;
        }
      } catch (error) {
        result.errors.push(`Failed to import category ${category.name}: ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Import assets
   */
  private static async importAssets(assets: any[], options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRecords: assets.length,
      importedRecords: 0,
      skippedRecords: 0,
      errors: [],
      warnings: []
    };

    for (const asset of assets) {
      try {
        if (options.validateOnly) {
          // Just validate
          if (!asset.itemName || !asset.categoryId) {
            result.errors.push(`Asset missing required fields: ${JSON.stringify(asset)}`);
            continue;
          }
          result.importedRecords++;
        } else {
          // Check if asset exists (by itemName and categoryId)
          const existing = await prisma.asset.findFirst({
            where: {
              itemName: asset.itemName,
              categoryId: asset.categoryId
            }
          });

          if (existing) {
            if (options.skipDuplicates) {
              result.skippedRecords++;
              continue;
            }
            if (options.updateExisting) {
              await prisma.asset.update({
                where: { id: existing.id },
                data: {
                  quantity: asset.quantity || existing.quantity,
                  modelBrand: asset.modelBrand || existing.modelBrand,
                  location: asset.location || existing.location,
                  purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : existing.purchaseDate,
                  purchasePrice: asset.purchasePrice || existing.purchasePrice,
                  notes: asset.notes || existing.notes,
                  supplier: asset.supplier || existing.supplier
                }
              });
            }
          } else {
            await prisma.asset.create({
              data: {
                itemName: asset.itemName,
                quantity: asset.quantity || 1,
                categoryId: asset.categoryId,
                modelBrand: asset.modelBrand,
                location: asset.location,
                status: asset.status || 'Available',
                purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
                purchasePrice: asset.purchasePrice,
                notes: asset.notes,
                supplier: asset.supplier
              }
            });
          }
          result.importedRecords++;
        }
      } catch (error) {
        result.errors.push(`Failed to import asset ${asset.itemName}: ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Import users
   */
  private static async importUsers(users: any[], options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRecords: users.length,
      importedRecords: 0,
      skippedRecords: 0,
      errors: [],
      warnings: []
    };

    for (const user of users) {
      try {
        if (options.validateOnly) {
          // Just validate
          if (!user.email || !user.name) {
            result.errors.push(`User missing required fields: ${JSON.stringify(user)}`);
            continue;
          }
          result.importedRecords++;
        } else {
          // Check if user exists
          const existing = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (existing) {
            if (options.skipDuplicates) {
              result.skippedRecords++;
              continue;
            }
            if (options.updateExisting) {
              await prisma.user.update({
                where: { id: existing.id },
                data: {
                  name: user.name,
                  role: user.role || existing.role,
                  department: user.department || existing.department,
                  phone: user.phone || existing.phone
                }
              });
            }
          } else {
            // Note: We don't import passwords for security reasons
            result.warnings.push(`User ${user.email} skipped - password required for new users`);
            result.skippedRecords++;
            continue;
          }
          result.importedRecords++;
        }
      } catch (error) {
        result.errors.push(`Failed to import user ${user.email}: ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Convert data to CSV format
   */
  private static convertToCSV(data: any): string {
    const csvRows: string[] = [];
    
    // Add headers
    const headers = Object.keys(data);
    csvRows.push(headers.join(','));

    // Add data rows
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        csvRows.push(`${key},${value.length} records`);
      } else {
        csvRows.push(`${key},${JSON.stringify(value)}`);
      }
    }

    return csvRows.join('\n');
  }

  /**
   * Convert data to XLSX format (placeholder)
   */
  private static async convertToXLSX(data: any): Promise<any> {
    // This would use a library like xlsx
    // For now, return JSON as placeholder
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parse CSV data
   */
  private static parseCSV(csvData: string): any {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const data: any = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const key = headers[i - 1];
        const value = values[i - 1];
        data[key] = value;
      }
    }

    return data;
  }

  /**
   * Parse XLSX data (placeholder)
   */
  private static async parseXLSX(xlsxData: any): Promise<any> {
    // This would use a library like xlsx
    // For now, return as-is
    return xlsxData;
  }

  /**
   * Generate data migration script
   */
  static async generateMigrationScript(fromVersion: string, toVersion: string): Promise<string> {
    const script = `
-- Data Migration Script
-- From: ${fromVersion}
-- To: ${toVersion}
-- Generated: ${new Date().toISOString()}

-- Backup existing data
CREATE TABLE IF NOT EXISTS backup_assets AS SELECT * FROM assets;
CREATE TABLE IF NOT EXISTS backup_categories AS SELECT * FROM categories;
CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users;

-- Migration steps would go here
-- This is a template for manual migration

-- Verify migration
SELECT COUNT(*) as asset_count FROM assets;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as user_count FROM users;
    `.trim();

    return script;
  }

  /**
   * Validate data integrity
   */
  static async validateDataIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for orphaned records
      const orphanedAssets = await prisma.asset.findMany({
        where: {
          categoryId: {
            not: {
              in: (await prisma.category.findMany({ select: { id: true } })).map(c => c.id)
            }
          }
        }
      });

      if (orphanedAssets.length > 0) {
        issues.push(`${orphanedAssets.length} assets have invalid category references`);
        recommendations.push('Update or remove assets with invalid categories');
      }

      // Check for duplicate asset names in same category
      const duplicateAssets = await prisma.$queryRaw`
        SELECT "itemName", "categoryId", COUNT(*) as count
        FROM assets
        GROUP BY "itemName", "categoryId"
        HAVING COUNT(*) > 1
      `;

      if (Array.isArray(duplicateAssets) && duplicateAssets.length > 0) {
        issues.push(`${duplicateAssets.length} duplicate asset names found`);
        recommendations.push('Review and merge duplicate assets');
      }

      // Check for assets with negative quantities
      const negativeQuantities = await prisma.asset.findMany({
        where: { quantity: { lt: 0 } }
      });

      if (negativeQuantities.length > 0) {
        issues.push(`${negativeQuantities.length} assets have negative quantities`);
        recommendations.push('Fix negative quantities in assets');
      }

      return {
        valid: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        valid: false,
        issues: ['Failed to validate data integrity'],
        recommendations: ['Check database connection and permissions']
      };
    }
  }
} 