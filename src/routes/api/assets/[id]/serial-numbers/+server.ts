import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

// Get serial numbers for an asset
export const GET: RequestHandler = async (event) => {
	try {
		await requireAuth(event);
		
		const assetId = parseInt(event.params.id);
		
		const serialNumbers = await prisma.assetSerialNumber.findMany({
			where: { assetId },
			orderBy: { id: 'asc' }
		});
		
		return json(serialNumbers);
	} catch (error) {
		console.error('Error fetching serial numbers:', error);
		return json({ error: 'Failed to fetch serial numbers' }, { status: 500 });
	}
};

// Add a new serial number to an asset
export const POST: RequestHandler = async (event) => {
	try {
		await requireAuth(event);
		
		const assetId = parseInt(event.params.id);
		const { serialNumber, notes } = await event.request.json();
		
		if (!serialNumber || !serialNumber.trim()) {
			return json({ error: 'Serial number is required' }, { status: 400 });
		}
		
		// Check if asset exists
		const asset = await prisma.asset.findUnique({
			where: { id: assetId }
		});
		
		if (!asset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}
		
		// Check if serial number already exists for this asset
		const existing = await prisma.assetSerialNumber.findFirst({
			where: {
				assetId,
				serialNumber: serialNumber.trim()
			}
		});
		
		if (existing) {
			return json({ error: 'Serial number already exists for this asset' }, { status: 400 });
		}
		
		const newSerialNumber = await prisma.assetSerialNumber.create({
			data: {
				assetId,
				serialNumber: serialNumber.trim(),
				notes: notes || null
			}
		});
		
		return json(newSerialNumber);
	} catch (error) {
		console.error('Error creating serial number:', error);
		return json({ error: 'Failed to create serial number' }, { status: 500 });
	}
}; 