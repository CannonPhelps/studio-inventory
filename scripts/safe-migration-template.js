// SAFE MIGRATION TEMPLATE
// Use this pattern when you need to migrate data before schema changes

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function safeMigration() {
  console.log('Starting safe migration...');
  
  try {
    // STEP 1: Backup existing data
    console.log('Step 1: Backing up existing data...');
    const assetsWithSerialNumbers = await prisma.asset.findMany({
      where: {
        serialNumber: {
          not: null,
        },
      },
      select: {
        id: true,
        serialNumber: true,
      },
    });
    
    console.log(`Found ${assetsWithSerialNumbers.length} assets with serial numbers`);
    
    // STEP 2: Migrate data to new structure
    console.log('Step 2: Migrating data to new structure...');
    let migrated = 0;
    
    for (const asset of assetsWithSerialNumbers) {
      if (!asset.serialNumber) continue;
      
      // Check if already exists to avoid duplicates
      const exists = await prisma.assetSerialNumber.findFirst({
        where: {
          assetId: asset.id,
          serialNumber: asset.serialNumber,
        },
      });
      
      if (!exists) {
        await prisma.assetSerialNumber.create({
          data: {
            assetId: asset.id,
            serialNumber: asset.serialNumber,
          },
        });
        migrated++;
      }
    }
    
    console.log(`Successfully migrated ${migrated} serial numbers`);
    
    // STEP 3: Verify migration
    console.log('Step 3: Verifying migration...');
    const totalSerialNumbers = await prisma.assetSerialNumber.count();
    console.log(`Total serial numbers in new table: ${totalSerialNumbers}`);
    
    if (totalSerialNumbers >= migrated) {
      console.log('✅ Migration successful! Now you can safely run the schema migration.');
      console.log('⚠️  IMPORTANT: Only after this script runs successfully, run:');
      console.log('   npx prisma migrate dev --name remove_old_serial_number_field');
    } else {
      console.log('❌ Migration verification failed!');
      throw new Error('Migration verification failed');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  safeMigration()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { safeMigration }; 