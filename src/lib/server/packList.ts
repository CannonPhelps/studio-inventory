import { prisma } from '$lib/db';

export interface PackListInput {
  name: string;
  description?: string;
  projectId?: number;
  status?: string;
  fromKitId?: number;
  referenceCode?: string;
  destination?: string;
  dueAt?: string | Date;
  checkedOutAt?: string | Date;
  returnedAt?: string | Date;
  packedBy?: string;
  checkedBy?: string;
  notes?: string;
}

export class PackListService {
  static async create(data: PackListInput) {
    const { fromKitId, ...base } = data;

    if (fromKitId) {
      return await prisma.$transaction(async (tx) => {
        const packList = await tx.packList.create({
          data: { ...base, fromKitId }
        });

        const kitAssets = await tx.kitAsset.findMany({
          where: { kitId: fromKitId }
        });

        if (kitAssets.length > 0) {
          await tx.packListItem.createMany({
            data: kitAssets.map((ka) => ({
              packListId: packList.id,
              assetId: ka.assetId,
              quantityRequested: ka.quantity ?? 1,
              quantityPacked: 0
            }))
          });
        }

        return packList;
      });
    }

    return await prisma.packList.create({ data: base });
  }

  static async update(id: number, data: Partial<PackListInput>) {
    const { fromKitId, ...base } = data;
    return await prisma.packList.update({ where: { id }, data: base });
  }

  static async delete(id: number) {
    await prisma.packList.delete({ where: { id } });
  }

  static async list() {
    return await prisma.packList.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async get(id: number) {
    return await prisma.packList.findUnique({
      where: { id },
      include: { items: { include: { asset: true } } }
    });
  }

  static async items(packListId: number) {
    return await prisma.packListItem.findMany({
      where: { packListId },
      include: { asset: true }
    });
  }

  static async addItem(packListId: number, assetId: number, quantityRequested: number, notes?: string) {
    return await prisma.packListItem.upsert({
      where: { packListId_assetId: { packListId, assetId } },
      update: { quantityRequested, notes },
      create: { packListId, assetId, quantityRequested, notes }
    });
  }

  static async removeItem(packListId: number, assetId: number) {
    await prisma.packListItem.delete({ where: { packListId_assetId: { packListId, assetId } } });
  }

  static async setItemPackedQuantity(packListId: number, assetId: number, quantityPacked: number) {
    return await prisma.packListItem.update({
      where: { packListId_assetId: { packListId, assetId } },
      data: { quantityPacked }
    });
  }

  static async setItemRequestedQuantity(packListId: number, assetId: number, quantityRequested: number) {
    return await prisma.packListItem.update({
      where: { packListId_assetId: { packListId, assetId } },
      data: { quantityRequested }
    });
  }

  static async setItemSubstitute(packListId: number, assetId: number, substituteAssetId: number | null) {
    return await prisma.packListItem.update({
      where: { packListId_assetId: { packListId, assetId } },
      data: { substituteAssetId }
    });
  }

  static async setItemSerialNumbers(packListId: number, assetId: number, serialNumbers: string[]) {
    return await prisma.packListItem.update({
      where: { packListId_assetId: { packListId, assetId } },
      data: { serialNumbers }
    });
  }
}


