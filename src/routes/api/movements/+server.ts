import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const assetId = event.url.searchParams.get('assetId');
		const fromDate = event.url.searchParams.get('fromDate');
		const toDate = event.url.searchParams.get('toDate');
		
		const where: {
			assetId?: number;
			movedAt?: {
				gte?: Date;
				lte?: Date;
			};
		} = {};
		
		if (assetId) {
			where.assetId = parseInt(assetId);
		}
		
		if (fromDate || toDate) {
			where.movedAt = {};
			if (fromDate) where.movedAt.gte = new Date(fromDate);
			if (toDate) where.movedAt.lte = new Date(toDate);
		}
		
		const movements = await prisma.movement.findMany({
			where,
			include: {
				asset: {
					include: {
						category: true
					}
				}
			},
			orderBy: { movedAt: 'desc' }
		});
		
		return json(movements);
	} catch (error) {
		console.error('Error fetching movements:', error);
		return json({ error: 'Failed to fetch movements' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const { assetId, fromLocation, toLocation, reason, notes } = await event.request.json();
		
		if (!assetId || !fromLocation || !toLocation) {
			return json({ error: 'Asset ID, from location, and to location are required' }, { status: 400 });
		}
		
		const movement = await prisma.movement.create({
			data: {
				assetId: parseInt(assetId),
				fromLocation,
				toLocation,
				reason: reason || null,
				notes: notes || null
			},
			include: {
				asset: {
					include: {
						category: true
					}
				}
			}
		});
		
		// Update asset location
		await prisma.asset.update({
			where: { id: parseInt(assetId) },
			data: { location: toLocation }
		});
		
		return json(movement, { status: 201 });
	} catch (error) {
		console.error('Error creating movement:', error);
		return json({ error: 'Failed to create movement' }, { status: 500 });
	}
}; 