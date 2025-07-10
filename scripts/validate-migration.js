#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DANGEROUS_OPERATIONS = [
  'DROP COLUMN',
  'DROP TABLE',
  'ALTER TABLE.*DROP',
  'DELETE FROM',
  'TRUNCATE'
];

function validateMigration(migrationPath) {
  console.log(`🔍 Validating migration: ${migrationPath}`);
  
  const content = fs.readFileSync(migrationPath, 'utf8');
  const lines = content.split('\n');
  
  let hasDangerousOps = false;
  let warnings = [];
  
  lines.forEach((line, index) => {
    const upperLine = line.toUpperCase();
    
    DANGEROUS_OPERATIONS.forEach(op => {
      if (upperLine.includes(op)) {
        hasDangerousOps = true;
        warnings.push(`Line ${index + 1}: ${line.trim()}`);
      }
    });
  });
  
  if (hasDangerousOps) {
    console.log('❌ DANGEROUS OPERATIONS DETECTED!');
    console.log('This migration will cause data loss:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
    console.log('\n⚠️  Before running this migration:');
    console.log('  1. Create a data migration script');
    console.log('  2. Test in development');
    console.log('  3. Backup production database');
    console.log('  4. Run data migration first');
    console.log('  5. Only then run schema migration');
    process.exit(1);
  } else {
    console.log('✅ Migration appears safe');
  }
}

// Get the latest migration
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
const migrations = fs.readdirSync(migrationsDir)
  .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
  .filter(dir => dir.match(/^\d{14}_/))
  .sort()
  .reverse();

if (migrations.length === 0) {
  console.log('No migrations found');
  process.exit(0);
}

const latestMigration = migrations[0];
const migrationPath = path.join(migrationsDir, latestMigration, 'migration.sql');

if (fs.existsSync(migrationPath)) {
  validateMigration(migrationPath);
} else {
  console.log('Migration file not found');
  process.exit(1);
} 