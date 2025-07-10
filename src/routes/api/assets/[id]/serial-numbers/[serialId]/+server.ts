import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

// Update a serial number
export const PUT: RequestHandler = async (event) => {
	try {
		await requireAuth(event);
		
		const serialId = parseInt(event.params.serialId);
		const { serialNumber, notes } = await event.request.json();
		
		if (!serialNumber || !serialNumber.trim()) {
			return json({ error: 'Serial number is required' }, { status: 400 });
		}
		
		// Check if serial number exists
		const existing = await prisma.assetSerialNumber.findUnique({
			where: { id: serialId }
		});
		
		if (!existing) {
			return json({ error: 'Serial number not found' }, { status: 404 });
		}
		
		// Check if the new serial number already exists for this asset
		const duplicate = await prisma.assetSerialNumber.findFirst({
			where: {
				assetId: existing.assetId,
				serialNumber: serialNumber.trim(),
				id: { not: serialId }
			}
		});
		
		if (duplicate) {
			return json({ error: 'Serial number already exists for this asset' }, { status: 400 });
		}
		
		const updated = await prisma.assetSerialNumber.update({
			where: { id: serialId },
			data: {
				serialNumber: serialNumber.trim(),
				notes: notes || null
			}
		});
		
		return json(updated);
	} catch (error) {
		console.error('Error updating serial number:', error);
		return json({ error: 'Failed to update serial number' }, { status: 500 });
	}
};

// Delete a serial number
export const DELETE: RequestHandler = async (event) => {
	try {
		await requireAuth(event);
		
		const serialId = parseInt(event.params.serialId);
		
		// Check if serial number exists
		const existing = await prisma.assetSerialNumber.findUnique({
			where: { id: serialId }
		});
		
		if (!existing) {
			return json({ error: 'Serial number not found' }, { status: 404 });
		}
		
		await prisma.assetSerialNumber.delete({
			where: { id: serialId }
		});
		
		return json({ message: 'Serial number deleted successfully' });
	} catch (error) {
		console.error('Error deleting serial number:', error);
		return json({ error: 'Failed to delete serial number' }, { status: 500 });
	}
}; 