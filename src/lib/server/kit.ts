import { prisma } from '$lib/db';

export interface KitInput {
  name: string;
  description?: string;
  status?: string;
}

export class KitService {
  static async create(data: KitInput) {
    return await prisma.kit.create({ data });
  }

  static async update(id: number, data: Partial<KitInput>) {
    return await prisma.kit.update({ where: { id }, data });
  }

  static async delete(id: number) {
    await prisma.kit.delete({ where: { id } });
  }

  static async list() {
    return await prisma.kit.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async get(id: number) {
    return await prisma.kit.findUnique({ where: { id }, include: { assets: { include: { asset: true } } } });
  }

  static async addAsset(kitId: number, assetId: number, quantity?: number) {
    return await prisma.kitAsset.create({ data: { kitId, assetId, quantity } });
  }

  static async removeAsset(kitId: number, assetId: number) {
    await prisma.kitAsset.delete({ where: { kitId_assetId: { kitId, assetId } } });
  }

  static async assets(kitId: number) {
    return await prisma.kitAsset.findMany({ where: { kitId }, include: { asset: true } });
  }
} 