import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
	log: ['query', 'error', 'warn'],
	errorFormat: 'pretty',
});

// In development, store the client on globalThis to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect();
});

// Export db object for API routes (backward compatibility)
export const db = prisma;

// Database connection health check
export async function checkDatabaseConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return { connected: true };
	} catch (error) {
		console.error('Database connection failed:', error);
		return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

// —— Categories ——
export function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}
export function getAllCategories() {
  return prisma.category.findMany();
}

// —— Assets (including cables) ——
export function createAsset(data: {
  tag: string;
  name: string;
  description?: string;
  categoryId: number;
  cableLength?: number;
  connectorIn?: string;
  connectorOut?: string;
}) {
  return prisma.asset.create({ data });
}
export function getAllAssets() {
  return prisma.asset.findMany({
    include: {
      category: true,
      stockLevels: true,
      maintenances: true,
      checkouts: { where: { returnedAt: null } }
    }
  });
}

// —— Stock Movements ——
export function moveAsset(params: {
  assetId: number;
  locationId: number;
  change: number;
  reference?: string;
}) {
  const { assetId, locationId, change, reference } = params;
  return prisma.$transaction(async (tx) => {
    await tx.movement.create({ data: { assetId, locationId, change, reference } });
    const existing = await tx.stockLevel.findUnique({
      where: { assetId_locationId: { assetId, locationId } }
    });
    if (existing) {
      return tx.stockLevel.update({
        where: { assetId_locationId: { assetId, locationId } },
        data: { quantity: existing.quantity + change }
      });
    }
    return tx.stockLevel.create({ data: { assetId, locationId, quantity: change } });
  });
}

// —— Maintenance ——
export function recordMaintenance(params: {
  assetId: number;
  notes?: string;
  performedBy?: string;
}) {
  return prisma.maintenanceRecord.create({ data: params });
}

// —— Checkouts & Returns ——
export function checkoutAsset(params: {
  assetId: number;
  user: string;
  dueAt: Date;
  notes?: string;
}) {
  return prisma.checkout.create({ data: params });
}

export function returnAsset(checkoutId: number) {
  return prisma.checkout.update({
    where: { id: checkoutId },
    data: { returnedAt: new Date() }
  });
}
