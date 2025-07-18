import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const { id } = event.params;
		
		// Get all maintenance records for this asset
		const maintenanceRecords = await prisma.maintenanceRecord.findMany({
			where: { assetId: parseInt(id) },
			include: {
				asset: {
					include: {
						category: true
					}
				}
			},
			orderBy: { performedAt: 'desc' }
		});
		
		// Get the asset details
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(id) },
			include: {
				category: true,
				serialNumbers: true
			}
		});
		
		if (!asset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}
		
		return json({
			asset,
			maintenanceRecords,
			totalRecords: maintenanceRecords.length,
			totalCost: maintenanceRecords.reduce((sum, record) => sum + (parseFloat(record.cost?.toString() || '0')), 0)
		});
		
	} catch (error) {
		console.error('Error fetching maintenance log:', error);
		return json({ error: 'Failed to fetch maintenance log' }, { status: 500 });
	}
}; 