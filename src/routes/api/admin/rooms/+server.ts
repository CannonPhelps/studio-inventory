import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { RoomService } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

// Get all rooms
export const GET: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		
		const url = new URL(event.request.url);
		const building = url.searchParams.get('building') || undefined;
		const floor = url.searchParams.get('floor') || undefined;
		const type = url.searchParams.get('type') || undefined;
		const isActive = url.searchParams.get('isActive');
		
		const filters = {
			building,
			floor,
			type,
			isActive: isActive !== null ? isActive === 'true' : undefined
		};
		
		const rooms = await RoomService.getRooms(filters);
		return json(rooms);
	} catch (error) {
		console.error('Error getting rooms:', error);
		return json({ error: 'Failed to get rooms' }, { status: 500 });
	}
};

// Create a new room
export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		
		const data = await event.request.json();
		
		if (!data.name) {
			return json({ error: 'Room name is required' }, { status: 400 });
		}
		
		const room = await RoomService.createRoom({
			name: data.name,
			description: data.description,
			building: data.building,
			floor: data.floor,
			capacity: data.capacity ? parseInt(data.capacity) : undefined,
			type: data.type
		});
		
		return json(room, { status: 201 });
	} catch (error) {
		console.error('Error creating room:', error);
		return json({ error: 'Failed to create room' }, { status: 500 });
	}
}; 