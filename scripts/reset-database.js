// Reset database - Drop all tables and run fresh migrations
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🚨 DATABASE RESET WARNING 🚨');
  console.log('This will completely delete ALL data in your database!');
  console.log('This action cannot be undone.\n');
  
  // Check if force flag is provided
  const FORCE = process.argv.includes('--force');
  
  if (!FORCE) {
    console.log('To proceed, run with --force flag:');
    console.log('node scripts/reset-database.js --force\n');
    console.log('⚠️  This will:');
    console.log('  - Drop all tables');
    console.log('  - Delete all data');
    console.log('  - Run fresh migrations');
    console.log('  - Reset the database to initial state');
    return;
  }
  
  console.log('⚠️  FORCE MODE - Proceeding with database reset...\n');
  
  try {
    // Step 1: Drop all tables
    console.log('🗑️  Dropping all tables...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await prisma.$executeRaw`CREATE SCHEMA public`;
    console.log('✅ All tables dropped');
    
    // Step 2: Run fresh migrations
    console.log('\n🔄 Running fresh migrations...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Migrations completed');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
    
    // Step 3: Generate Prisma client
    console.log('\n🔧 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.error('❌ Prisma client generation failed:', error.message);
      throw error;
    }
    
    // Step 4: Verify database is clean
    console.log('\n🔍 Verifying database state...');
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log(`✅ Database reset complete! Found ${tableCount[0].count} tables`);
    
    // Step 5: Show next steps
    console.log('\n📋 Next steps:');
    console.log('1. Your database is now clean and ready for use');
    console.log('2. You can start adding new data');
    console.log('3. If you need to seed initial data, run your seed scripts');
    console.log('4. Start your application to verify everything works');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    console.log('\n💡 If you encounter issues:');
    console.log('1. Check your database connection');
    console.log('2. Ensure you have proper permissions');
    console.log('3. Try running migrations manually: npx prisma migrate deploy');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node scripts/reset-database.js [options]

Options:
  --force     Actually perform the database reset (required)
  --help      Show this help message

⚠️  WARNING: This will completely delete ALL data in your database!

Examples:
  node scripts/reset-database.js --force
  `);
  process.exit(0);
}

resetDatabase()
  .then(() => {
    console.log('\n✅ Database reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database reset failed:', error);
    process.exit(1);
  }); 