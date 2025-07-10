import { prisma } from '$lib/db';

export interface RoomStats {
  id: number;
  name: string;
  totalAssets: number;
  availableAssets: number;
  checkedOutAssets: number;
  totalValue: number;
  utilization: number; // percentage
}

export interface RoomWithStats extends RoomStats {
  description?: string;
  building?: string;
  floor?: string;
  capacity?: number;
  type?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoomService {
  /**
   * Get all rooms with optional filtering
   */
  static async getRooms(filters?: {
    building?: string;
    floor?: string;
    type?: string;
    isActive?: boolean;
  }): Promise<RoomWithStats[]> {
    try {
      const where: Record<string, string | boolean> = {};
      
      if (filters?.building) where.building = filters.building;
      if (filters?.floor) where.floor = filters.floor;
      if (filters?.type) where.type = filters.type;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;

      const rooms = await prisma.room.findMany({
        where,
        include: {
          assets: {
            select: {
              status: true,
              purchasePrice: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      return rooms.map(room => {
        const totalAssets = room.assets.length;
        const availableAssets = room.assets.filter(asset => asset.status === 'Available').length;
        const checkedOutAssets = room.assets.filter(asset => asset.status === 'Checked Out').length;
        const totalValue = room.assets.reduce((sum, asset) => 
          sum + (asset.purchasePrice ? Number(asset.purchasePrice) : 0), 0
        );
        const utilization = room.capacity ? Math.round((totalAssets / room.capacity) * 100) : 0;

        return {
          id: room.id,
          name: room.name,
          description: room.description,
          building: room.building,
          floor: room.floor,
          capacity: room.capacity,
          type: room.type,
          isActive: room.isActive,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          totalAssets,
          availableAssets,
          checkedOutAssets,
          totalValue,
          utilization
        };
      });
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw new Error('Failed to get rooms');
    }
  }

  /**
   * Get room by ID with detailed stats
   */
  static async getRoomById(id: number): Promise<RoomWithStats | null> {
    try {
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          assets: {
            include: {
              category: true,
              serialNumbers: true
            }
          }
        }
      });

      if (!room) return null;

      const totalAssets = room.assets.length;
      const availableAssets = room.assets.filter(asset => asset.status === 'Available').length;
      const checkedOutAssets = room.assets.filter(asset => asset.status === 'Checked Out').length;
      const totalValue = room.assets.reduce((sum, asset) => 
        sum + (asset.purchasePrice ? Number(asset.purchasePrice) : 0), 0
      );
      const utilization = room.capacity ? Math.round((totalAssets / room.capacity) * 100) : 0;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        type: room.type,
        isActive: room.isActive,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        totalAssets,
        availableAssets,
        checkedOutAssets,
        totalValue,
        utilization
      };
    } catch (error) {
      console.error('Error getting room by ID:', error);
      throw new Error('Failed to get room');
    }
  }

  /**
   * Create a new room
   */
  static async createRoom(data: {
    name: string;
    description?: string;
    building?: string;
    floor?: string;
    capacity?: number;
    type?: string;
  }): Promise<RoomWithStats> {
    try {
      const room = await prisma.room.create({
        data,
        include: {
          assets: {
            select: {
              status: true,
              purchasePrice: true
            }
          }
        }
      });

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        type: room.type,
        isActive: room.isActive,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        totalAssets: 0,
        availableAssets: 0,
        checkedOutAssets: 0,
        totalValue: 0,
        utilization: 0
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  /**
   * Update a room
   */
  static async updateRoom(id: number, data: {
    name?: string;
    description?: string;
    building?: string;
    floor?: string;
    capacity?: number;
    type?: string;
    isActive?: boolean;
  }): Promise<RoomWithStats> {
    try {
      const room = await prisma.room.update({
        where: { id },
        data,
        include: {
          assets: {
            select: {
              status: true,
              purchasePrice: true
            }
          }
        }
      });

      const totalAssets = room.assets.length;
      const availableAssets = room.assets.filter(asset => asset.status === 'Available').length;
      const checkedOutAssets = room.assets.filter(asset => asset.status === 'Checked Out').length;
      const totalValue = room.assets.reduce((sum, asset) => 
        sum + (asset.purchasePrice ? Number(asset.purchasePrice) : 0), 0
      );
      const utilization = room.capacity ? Math.round((totalAssets / room.capacity) * 100) : 0;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        type: room.type,
        isActive: room.isActive,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        totalAssets,
        availableAssets,
        checkedOutAssets,
        totalValue,
        utilization
      };
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error('Failed to update room');
    }
  }

  /**
   * Delete a room (only if no assets are assigned)
   */
  static async deleteRoom(id: number): Promise<boolean> {
    try {
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          _count: {
            select: { assets: true }
          }
        }
      });

      if (!room) {
        throw new Error('Room not found');
      }

      if (room._count.assets > 0) {
        throw new Error('Cannot delete room with assigned assets');
      }

      await prisma.room.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  /**
   * Move assets between rooms
   */
  static async moveAssets(data: {
    assetIds: number[];
    fromRoomId?: number;
    toRoomId: number;
    reason?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const { assetIds, fromRoomId, toRoomId, reason, notes } = data;

      // Update assets
      await prisma.asset.updateMany({
        where: { id: { in: assetIds } },
        data: { roomId: toRoomId }
      });

      // Create movement records
      const movements = assetIds.map(assetId => ({
        assetId,
        fromLocation: fromRoomId ? `Room ${fromRoomId}` : 'Unknown',
        toLocation: `Room ${toRoomId}`,
        fromRoomId,
        toRoomId,
        reason,
        notes
      }));

      await prisma.movement.createMany({
        data: movements
      });

      return true;
    } catch (error) {
      console.error('Error moving assets:', error);
      throw new Error('Failed to move assets');
    }
  }

  /**
   * Get room utilization statistics
   */
  static async getRoomUtilization(): Promise<{
    totalRooms: number;
    activeRooms: number;
    averageUtilization: number;
    mostUtilized: RoomStats[];
    leastUtilized: RoomStats[];
  }> {
    try {
      const rooms = await this.getRooms();
      
      const activeRooms = rooms.filter(room => room.isActive);
      const totalRooms = rooms.length;
      const averageUtilization = activeRooms.length > 0 
        ? Math.round(activeRooms.reduce((sum, room) => sum + room.utilization, 0) / activeRooms.length)
        : 0;

      const mostUtilized = activeRooms
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 5);

      const leastUtilized = activeRooms
        .sort((a, b) => a.utilization - b.utilization)
        .slice(0, 5);

      return {
        totalRooms,
        activeRooms: activeRooms.length,
        averageUtilization,
        mostUtilized,
        leastUtilized
      };
    } catch (error) {
      console.error('Error getting room utilization:', error);
      throw new Error('Failed to get room utilization');
    }
  }

  /**
   * Get assets in a specific room
   */
  static async getRoomAssets(roomId: number): Promise<any[]> {
    try {
      const assets = await prisma.asset.findMany({
        where: { roomId },
        include: {
          category: true,
          serialNumbers: true,
          checkouts: {
            where: { returnedAt: null },
            orderBy: { checkoutAt: 'desc' },
            take: 1
          }
        },
        orderBy: { itemName: 'asc' }
      });

      return assets;
    } catch (error) {
      console.error('Error getting room assets:', error);
      throw new Error('Failed to get room assets');
    }
  }

  /**
   * Get available rooms (for dropdowns)
   */
  static async getAvailableRooms(): Promise<Array<{ id: number; name: string; building?: string; floor?: string }>> {
    try {
      const rooms = await prisma.room.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          building: true,
          floor: true
        },
        orderBy: { name: 'asc' }
      });

      return rooms;
    } catch (error) {
      console.error('Error getting available rooms:', error);
      throw new Error('Failed to get available rooms');
    }
  }

  /**
   * Get room types for filtering
   */
  static async getRoomTypes(): Promise<string[]> {
    try {
      const types = await prisma.room.findMany({
        where: { 
          type: { not: null },
          isActive: true 
        },
        select: { type: true },
        distinct: ['type']
      });

      return types.map(t => t.type!).filter(Boolean);
    } catch (error) {
      console.error('Error getting room types:', error);
      throw new Error('Failed to get room types');
    }
  }

  /**
   * Get buildings for filtering
   */
  static async getBuildings(): Promise<string[]> {
    try {
      const buildings = await prisma.room.findMany({
        where: { 
          building: { not: null },
          isActive: true 
        },
        select: { building: true },
        distinct: ['building']
      });

      return buildings.map(b => b.building!).filter(Boolean);
    } catch (error) {
      console.error('Error getting buildings:', error);
      throw new Error('Failed to get buildings');
    }
  }
} 