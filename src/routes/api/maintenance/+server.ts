import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const assetId = event.url.searchParams.get('assetId');
		
		const where: {
			assetId?: number;
		} = {};
		
		if (assetId) {
			where.assetId = parseInt(assetId);
		}
		
		const maintenanceRecords = await db.maintenanceRecord.findMany({
			where,
			include: {
				asset: {
					include: {
						category: true
					}
				}
			},
			orderBy: { performedAt: 'desc' }
		});
		
		return json(maintenanceRecords);
	} catch (error) {
		console.error('Error fetching maintenance records:', error);
		return json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const { assetId, notes, performedBy } = await event.request.json();
		
		if (!assetId) {
			return json({ error: 'Asset ID is required' }, { status: 400 });
		}
		
		const maintenance = await db.maintenanceRecord.create({
			data: {
				assetId: parseInt(assetId),
				notes: notes || null,
				performedBy: performedBy || null
			},
			include: {
				asset: {
					include: {
						category: true
					}
				}
			}
		});
		
		return json(maintenance, { status: 201 });
	} catch (error) {
		console.error('Error creating maintenance record:', error);
		return json({ error: 'Failed to create maintenance record' }, { status: 500 });
	}
}; 