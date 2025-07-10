# Production Migration Checklist

## Before Running Any Migration in Production

### 1. **Review Migration Files**
```bash
# Check what the migration will do
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma

# Review specific migration
cat prisma/migrations/[MIGRATION_NAME]/migration.sql
```

### 2. **Look for Dangerous Operations**
- ❌ `DROP COLUMN` - Data will be lost
- ❌ `DROP TABLE` - All data will be lost
- ❌ `ALTER TABLE ... DROP` - Data will be lost
- ⚠️ `RENAME COLUMN` - Usually safe but verify
- ✅ `ADD COLUMN` - Safe
- ✅ `CREATE TABLE` - Safe
- ✅ `CREATE INDEX` - Safe

### 3. **If Migration Contains Data Loss Operations**

#### Step 1: Create Data Migration Script
```javascript
// Create a script that migrates data BEFORE schema change
// See scripts/safe-migration-template.js for pattern
```

#### Step 2: Test in Development
```bash
# 1. Run data migration script
node scripts/migrate-data.js

# 2. Verify data was migrated correctly
node scripts/verify-migration.js

# 3. Only then run schema migration
npx prisma migrate dev
```

#### Step 3: Production Deployment
```bash
# 1. Backup production database
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run data migration script
node scripts/migrate-data.js

# 3. Verify migration
node scripts/verify-migration.js

# 4. Run schema migration
npx prisma migrate deploy
```

### 4. **Safe Migration Pattern**

For any schema change that might lose data:

1. **Create a data migration script** that copies data to new structure
2. **Test the script** in development
3. **Run the script** in production BEFORE schema migration
4. **Verify the migration** was successful
5. **Only then** run the schema migration

### 5. **Emergency Rollback Plan**

Always have a rollback plan:
```bash
# If something goes wrong, restore from backup
psql your_database < backup_$(date +%Y%m%d_%H%M%S).sql

# Or rollback to previous migration
npx prisma migrate resolve --rolled-back [MIGRATION_NAME]
```

### 6. **Monitoring**

After migration:
- Check application logs for errors
- Verify critical functionality works
- Monitor database performance
- Check data integrity

## Example: Safe Serial Number Migration

```bash
# 1. Create migration script
# 2. Test in development
# 3. Backup production
# 4. Run data migration
# 5. Verify
# 6. Run schema migration
# 7. Monitor
```

## Never Skip These Steps in Production!

- ❌ Never run migrations without reviewing them
- ❌ Never run data-loss migrations without backup
- ❌ Never run migrations without testing in development first
- ✅ Always backup before production migrations
- ✅ Always verify data migration before schema migration
- ✅ Always have a rollback plan 