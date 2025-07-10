// Migrate serial numbers from Asset.serialNumber to AssetSerialNumber
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateSerialNumbers() {
  const assets = await prisma.asset.findMany({
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

  let migrated = 0;
  for (const asset of assets) {
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
  console.log(`Migrated ${migrated} serial numbers.`);
}

migrateSerialNumbers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 