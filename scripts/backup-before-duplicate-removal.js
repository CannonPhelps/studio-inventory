// Backup assets and related data before duplicate removal
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupAssets() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', `duplicate-removal-backup-${timestamp}`);
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  console.log(`📁 Creating backup in: ${backupDir}\n`);
  
  try {
    // Backup assets
    console.log('📦 Backing up assets...');
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        room: true,
        cableType: true,
        serialNumbers: true,
        cableAssembly: true
      }
    });
    
    fs.writeFileSync(
      path.join(backupDir, 'assets.json'),
      JSON.stringify(assets, null, 2)
    );
    console.log(`  ✅ Backed up ${assets.length} assets`);
    
    // Backup related data
    const relatedTables = [
      { name: 'checkouts', query: () => prisma.checkout.findMany() },
      { name: 'maintenance_records', query: () => prisma.maintenanceRecord.findMany() },
      { name: 'movements', query: () => prisma.movement.findMany() },
      { name: 'financial_records', query: () => prisma.financialRecord.findMany() },
      { name: 'kit_assets', query: () => prisma.kitAsset.findMany() },
      { name: 'asset_serial_numbers', query: () => prisma.assetSerialNumber.findMany() },
      { name: 'cable_segments', query: () => prisma.cableSegment.findMany() }
    ];
    
    for (const table of relatedTables) {
      console.log(`📋 Backing up ${table.name}...`);
      const data = await table.query();
      fs.writeFileSync(
        path.join(backupDir, `${table.name}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`  ✅ Backed up ${data.length} records`);
    }
    
    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      totalAssets: assets.length,
      description: 'Backup created before duplicate asset removal',
      tables: relatedTables.map(t => t.name)
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📊 Total assets backed up: ${assets.length}`);
    
    return backupDir;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting backup process...\n');
    
    const backupDir = await backupAssets();
    
    console.log('\n💡 Next steps:');
    console.log('1. Review the backup files to ensure data integrity');
    console.log('2. Run the duplicate removal script with --dry-run first');
    console.log('3. If satisfied, run with --force to actually remove duplicates');
    console.log(`4. Backup location: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 