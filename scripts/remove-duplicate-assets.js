// Remove duplicate assets from the database
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const VERBOSE = process.argv.includes('--verbose');

// Criteria for identifying duplicates
const DUPLICATE_CRITERIA = [
  {
    name: 'Exact Match (itemName + serialNumber)',
    criteria: ['itemName', 'serialNumber'],
    description: 'Assets with same name and serial number'
  },
  {
    name: 'Exact Match (itemName + modelBrand + serialNumber)',
    criteria: ['itemName', 'modelBrand', 'serialNumber'],
    description: 'Assets with same name, brand, and serial number'
  },
  {
    name: 'Similar Match (itemName + modelBrand)',
    criteria: ['itemName', 'modelBrand'],
    description: 'Assets with same name and brand (excluding null values)'
  }
];

async function findDuplicates() {
  console.log('🔍 Searching for duplicate assets...\n');
  
  const allDuplicates = [];
  
  for (const criterion of DUPLICATE_CRITERIA) {
    console.log(`Checking: ${criterion.name}`);
    
    const duplicates = await findDuplicatesByCriteria(criterion);
    if (duplicates.length > 0) {
      allDuplicates.push({
        criterion,
        duplicates
      });
      console.log(`  Found ${duplicates.length} duplicate groups`);
    } else {
      console.log('  No duplicates found');
    }
  }
  
  return allDuplicates;
}

async function findDuplicatesByCriteria(criterion) {
  const { criteria } = criterion;
  
  // Get all assets with the required fields
  const allAssets = await prisma.asset.findMany({
    select: {
      id: true,
      itemName: true,
      modelBrand: true,
      serialNumber: true,
      status: true,
      purchasePrice: true,
      quantity: true
    }
  });
  
  // Group assets by the specified criteria
  const groups = new Map();
  
  for (const asset of allAssets) {
    // Create a key based on the criteria
    const key = criteria.map(field => {
      const value = asset[field];
      return value === null ? 'NULL' : String(value);
    }).join('|');
    
    // Skip if any required field (except itemName) is null
    if (criteria.some(field => field !== 'itemName' && asset[field] === null)) {
      continue;
    }
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(asset);
  }
  
  // Filter to only groups with duplicates
  const result = [];
  for (const [, assets] of groups) {
    if (assets.length > 1) {
      // Sort by ID (lower ID = older record)
      assets.sort((a, b) => a.id - b.id);
      
      // Create group info
      const group = {};
      criteria.forEach(field => {
        group[field] = assets[0][field];
      });
      group.count = assets.length;
      
      result.push({
        group,
        assets
      });
    }
  }
  
  // Sort by count descending
  result.sort((a, b) => b.group.count - a.group.count);
  
  return result;
}

async function analyzeDuplicates(duplicates) {
  console.log('\n📊 Duplicate Analysis:\n');
  
  let totalDuplicates = 0;
  let totalToDelete = 0;
  
  for (const { criterion, duplicates: duplicateGroups } of duplicates) {
    console.log(`\n${criterion.name}:`);
    console.log(`${criterion.description}\n`);
    
    for (const { group, assets } of duplicateGroups) {
      console.log(`  Group: ${criterion.criteria.map(field => `${field}=${group[field] || 'NULL'}`).join(', ')}`);
      console.log(`  Count: ${assets.length} assets`);
      
      totalDuplicates += assets.length;
      
      // Keep the oldest asset (first by creation date, then by ID)
      const toKeep = assets[0];
      const toDelete = assets.slice(1);
      
      totalToDelete += toDelete.length;
      
             console.log(`  Keeping: ID ${toKeep.id} (${toKeep.itemName}) - Oldest record`);
      console.log(`  Deleting: ${toDelete.length} duplicates`);
      
             if (VERBOSE) {
         for (const asset of toDelete) {
           console.log(`    - ID ${asset.id} (${asset.itemName}) - Status: ${asset.status}`);
         }
       }
      
      console.log('');
    }
  }
  
  console.log(`\n📈 Summary:`);
  console.log(`  Total duplicate assets found: ${totalDuplicates}`);
  console.log(`  Assets to be deleted: ${totalToDelete}`);
  console.log(`  Assets to be kept: ${totalDuplicates - totalToDelete}`);
  
  return { totalDuplicates, totalToDelete };
}

async function checkRelatedData(assetIds) {
  console.log('\n🔗 Checking related data...\n');
  
  const relatedData = {};
  
  // Check various related tables using Prisma queries
  const checks = [
    { 
      name: 'Checkouts', 
      query: () => prisma.checkout.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Maintenance Records', 
      query: () => prisma.maintenanceRecord.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Movements', 
      query: () => prisma.movement.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Financial Records', 
      query: () => prisma.financialRecord.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Kit Assets', 
      query: () => prisma.kitAsset.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Asset Serial Numbers', 
      query: () => prisma.assetSerialNumber.count({ where: { assetId: { in: assetIds } } })
    },
    { 
      name: 'Cable Segments', 
      query: () => prisma.cableSegment.count({ where: { cableAssetId: { in: assetIds } } })
    }
  ];
  
  for (const check of checks) {
    const count = await check.query();
    relatedData[check.name] = count;
    console.log(`  ${check.name}: ${count} records`);
  }
  
  return relatedData;
}

async function mergeRelatedData(keepAssetId, deleteAssetIds) {
  console.log('\n🔄 Merging related data...\n');
  
  const operations = [
    { 
      name: 'Checkouts', 
      query: () => prisma.checkout.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Maintenance Records', 
      query: () => prisma.maintenanceRecord.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Movements', 
      query: () => prisma.movement.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Financial Records', 
      query: () => prisma.financialRecord.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Kit Assets', 
      query: () => prisma.kitAsset.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Asset Serial Numbers', 
      query: () => prisma.assetSerialNumber.updateMany({
        where: { assetId: { in: deleteAssetIds } },
        data: { assetId: keepAssetId }
      })
    },
    { 
      name: 'Cable Segments', 
      query: () => prisma.cableSegment.updateMany({
        where: { cableAssetId: { in: deleteAssetIds } },
        data: { cableAssetId: keepAssetId }
      })
    }
  ];
  
  let totalMerged = 0;
  
  for (const operation of operations) {
    try {
      const result = await operation.query();
      console.log(`  ${operation.name}: ${result.count} records updated`);
      totalMerged += result.count;
    } catch (error) {
      console.log(`  ${operation.name}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n  Total records merged: ${totalMerged}`);
  return totalMerged;
}

async function deleteDuplicates(duplicates) {
  console.log('\n🗑️  Deleting duplicate assets...\n');
  
  let totalDeleted = 0;
  
  for (const { criterion, duplicates: duplicateGroups } of duplicates) {
    console.log(`Processing: ${criterion.name}`);
    
    for (const { group, assets } of duplicateGroups) {
      const toKeep = assets[0];
      const toDelete = assets.slice(1);
      const deleteIds = toDelete.map(asset => asset.id);
      
      console.log(`  Group: ${criterion.criteria.map(field => `${field}=${group[field] || 'NULL'}`).join(', ')}`);
      console.log(`  Keeping: ID ${toKeep.id} (${toKeep.itemName})`);
      console.log(`  Deleting: ${deleteIds.length} duplicates (IDs: ${deleteIds.join(', ')})`);
      
      if (!DRY_RUN) {
        // First merge related data
        await mergeRelatedData(toKeep.id, deleteIds);
        
        // Then delete the duplicate assets
        const deleted = await prisma.asset.deleteMany({
          where: {
            id: { in: deleteIds }
          }
        });
        
        console.log(`  ✅ Deleted ${deleted.count} assets`);
        totalDeleted += deleted.count;
      } else {
        console.log(`  🔍 DRY RUN: Would delete ${deleteIds.length} assets`);
        totalDeleted += deleteIds.length;
      }
      
      console.log('');
    }
  }
  
  return totalDeleted;
}

async function main() {
  try {
    console.log('🚀 Starting duplicate asset removal process...\n');
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }
    
    if (FORCE) {
      console.log('⚠️  FORCE MODE - Will proceed without confirmation\n');
    }
    
    // Find duplicates
    const duplicates = await findDuplicates();
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // Analyze duplicates
    const { totalDuplicates, totalToDelete } = await analyzeDuplicates(duplicates);
    
    // Get all asset IDs that would be deleted
    const allDeleteIds = [];
    for (const { duplicates: duplicateGroups } of duplicates) {
      for (const { assets } of duplicateGroups) {
        const toDelete = assets.slice(1);
        allDeleteIds.push(...toDelete.map(asset => asset.id));
      }
    }
    
    // Check related data
    await checkRelatedData(allDeleteIds);
    
    // Log summary for user
    console.log(`\n📊 Summary for this run:`);
    console.log(`  Total duplicate assets found: ${totalDuplicates}`);
    console.log(`  Assets to be deleted: ${totalToDelete}`);
    console.log(`  Assets to be kept: ${totalDuplicates - totalToDelete}`);
    
    // Ask for confirmation (unless force mode)
    if (!FORCE && !DRY_RUN) {
      console.log('\n❓ Do you want to proceed with deleting these duplicates? (y/N)');
      
      // In a real script, you'd read from stdin
      // For now, we'll just show what would happen
      console.log('Please run with --force to proceed or --dry-run to preview');
      return;
    }
    
    // Delete duplicates
    const deletedCount = await deleteDuplicates(duplicates);
    
    console.log(`\n✅ Process completed!`);
    console.log(`  Total assets deleted: ${deletedCount}`);
    
    if (DRY_RUN) {
      console.log('\n💡 Run without --dry-run to actually perform the deletion');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node scripts/remove-duplicate-assets.js [options]

Options:
  --dry-run    Preview what would be deleted without making changes
  --force      Proceed without confirmation
  --verbose    Show detailed information about each duplicate
  --help       Show this help message

Examples:
  node scripts/remove-duplicate-assets.js --dry-run --verbose
  node scripts/remove-duplicate-assets.js --force
  `);
  process.exit(0);
}

main(); 