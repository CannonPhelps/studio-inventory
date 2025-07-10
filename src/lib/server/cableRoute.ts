import { prisma } from '$lib/db';

export interface CableRouteInput {
  name: string;
  description?: string;
  status?: string;
}

export class CableRouteService {
  static async list() {
    return await prisma.cableRoute.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async create(data: CableRouteInput) {
    return await prisma.cableRoute.create({ data });
  }

  static async get(id: number) {
    return await prisma.cableRoute.findUnique({ where: { id }, include: { segments: { orderBy: { order: 'asc' }, include: { fromRoom: true, toRoom: true, cable: true } } } });
  }

  static async update(id: number, data: Partial<CableRouteInput>) {
    return await prisma.cableRoute.update({ where: { id }, data });
  }

  static async delete(id: number) {
    await prisma.cableSegment.deleteMany({ where: { routeId: id } });
    await prisma.cableRoute.delete({ where: { id } });
  }

  // Segments
  static async listSegments(routeId: number) {
    return await prisma.cableSegment.findMany({ where: { routeId }, orderBy: { order: 'asc' }, include: { fromRoom: true, toRoom: true, cable: true } });
  }

  static async addSegment(routeId: number, data: { order: number; fromRoomId: number; toRoomId: number; cableAssetId?: number; length?: number; notes?: string }) {
    return await prisma.cableSegment.create({ data: { routeId, ...data } });
  }

  static async updateSegment(id: number, data: Partial<{ order: number; fromRoomId: number; toRoomId: number; cableAssetId?: number; length?: number; notes?: string }>) {
    return await prisma.cableSegment.update({ where: { id }, data });
  }

  static async deleteSegment(id: number) {
    await prisma.cableSegment.delete({ where: { id } });
  }
} 