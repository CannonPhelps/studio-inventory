import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const assets = await prisma.asset.findMany({
			include: {
				category: true,
				checkouts: {
					where: { returnedAt: null }
				}
			},
			orderBy: { id: 'desc' }
		});

		return json(assets);
	} catch (error) {
		console.error('Error fetching assets:', error);
		return json({ error: 'Failed to fetch assets' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const data = await event.request.json();
		
		const asset = await prisma.asset.create({
			data: {
				itemName: data.itemName,
				quantity: parseInt(data.quantity) || 1,
				categoryId: parseInt(data.categoryId),
				modelBrand: data.modelBrand,
				serialNumber: data.serialNumber,
				location: data.location,
				status: data.status || 'Available',
				purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
				purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
				lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
				warrantyExpiration: data.warrantyExpiration ? new Date(data.warrantyExpiration) : null,
				notes: data.notes,
				assigned: data.assigned,
				assetNumber: data.assetNumber,
				supplier: data.supplier,
				isCable: data.isCable || false,
				cableTypeId: data.cableTypeId ? parseInt(data.cableTypeId) : null,
				cableLength: data.cableLength ? parseFloat(data.cableLength) : null
			},
			include: {
				category: true
			}
		});

		return json(asset);
	} catch (error) {
		console.error('Error creating asset:', error);
		return json({ error: 'Failed to create asset' }, { status: 500 });
	}
}; 