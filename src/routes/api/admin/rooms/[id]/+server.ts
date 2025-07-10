import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { RoomService } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

// Get room by ID
export const GET: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		
		const roomId = parseInt(event.params.id);
		if (isNaN(roomId)) {
			return json({ error: 'Invalid room ID' }, { status: 400 });
		}
		
		const room = await RoomService.getRoomById(roomId);
		if (!room) {
			return json({ error: 'Room not found' }, { status: 404 });
		}
		
		return json(room);
	} catch (error) {
		console.error('Error getting room:', error);
		return json({ error: 'Failed to get room' }, { status: 500 });
	}
};

// Update room
export const PUT: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		
		const roomId = parseInt(event.params.id);
		if (isNaN(roomId)) {
			return json({ error: 'Invalid room ID' }, { status: 400 });
		}
		
		const data = await event.request.json();
		
		const room = await RoomService.updateRoom(roomId, {
			name: data.name,
			description: data.description,
			building: data.building,
			floor: data.floor,
			capacity: data.capacity ? parseInt(data.capacity) : undefined,
			type: data.type,
			isActive: data.isActive
		});
		
		return json(room);
	} catch (error) {
		console.error('Error updating room:', error);
		return json({ error: 'Failed to update room' }, { status: 500 });
	}
};

// Delete room
export const DELETE: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		
		const roomId = parseInt(event.params.id);
		if (isNaN(roomId)) {
			return json({ error: 'Invalid room ID' }, { status: 400 });
		}
		
		await RoomService.deleteRoom(roomId);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting room:', error);
		return json({ error: error instanceof Error ? error.message : 'Failed to delete room' }, { status: 500 });
	}
}; 