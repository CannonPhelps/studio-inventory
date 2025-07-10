import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);

  let migrated = 0;

  // Use raw SQL to avoid type issues when the Prisma client is out-of-date
  const assets = await prisma.$queryRawUnsafe<Array<{ id: number; serialnumber: string }>>('SELECT id, serial_number AS serialnumber FROM assets WHERE serial_number IS NOT NULL');

  for (const asset of assets) {
    const serial = asset.serialnumber;
    if (!serial) continue;

    try {
      await prisma.assetSerialNumber.create({
        data: {
          assetId: asset.id,
          serialNumber: serial
        }
      });
      migrated++;
    } catch {
      // Ignore duplicates or other constraint errors
    }
  }

  return json({ migrated });
}; 