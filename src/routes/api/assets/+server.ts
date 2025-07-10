import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import { AuditService } from '$lib/server/audit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		const user = await requireAuth(event);
		console.log('Assets API - User authenticated:', user.email, 'Role:', user.role);
		
		const assets = await prisma.asset.findMany({
			include: {
				category: true,
				serialNumbers: true,
				checkouts: {
					where: { returnedAt: null }
				}
			},
			orderBy: { id: 'desc' }
		});

		console.log('Assets API - Found assets:', assets.length);
		console.log('Assets API - First asset:', assets[0] ? assets[0].itemName : 'No assets');

		return json(assets);
	} catch (error) {
		console.error('Error fetching assets:', error);
		return json({ error: 'Failed to fetch assets' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		const user = await requireAuth(event);
		
		const data = await event.request.json();
		
		// Handle serial numbers - can be a string or array
		const serialNumbers = data.serialNumbers || [];
		const serialNumbersData = Array.isArray(serialNumbers) 
			? serialNumbers.filter(sn => sn && sn.trim())
			: (data.serialNumber && data.serialNumber.trim() ? [data.serialNumber] : []);
		
		const asset = await prisma.asset.create({
			data: {
				itemName: data.itemName,
				quantity: parseInt(data.quantity) || 1,
				categoryId: parseInt(data.categoryId),
				modelBrand: data.modelBrand,
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
				cableLength: data.cableLength ? parseFloat(data.cableLength) : null,
				serialNumbers: {
					create: serialNumbersData.map(sn => ({ serialNumber: sn }))
				}
			},
			include: {
				category: true,
				serialNumbers: true
			}
		});

		// Log the asset creation
		await AuditService.logAssetAction(
			'CREATE',
			asset.id,
			user.id,
			undefined,
			{ itemName: asset.itemName, categoryId: asset.categoryId, status: asset.status },
			`Asset "${asset.itemName}" created`,
			event
		);

		return json(asset);
	} catch (error) {
		console.error('Error creating asset:', error);
		return json({ error: 'Failed to create asset' }, { status: 500 });
	}
}; 