import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const { id } = event.params;
		const { status, notes, updatedBy } = await event.request.json();
		
		if (!status) {
			return json({ error: 'Status is required' }, { status: 400 });
		}
		
		// Get the maintenance record
		const maintenance = await prisma.maintenanceRecord.findUnique({
			where: { id: parseInt(id) },
			include: { asset: true }
		});
		
		if (!maintenance) {
			return json({ error: 'Maintenance record not found' }, { status: 404 });
		}
		
		// Create status update
		const update = await prisma.maintenanceUpdate.create({
			data: {
				maintenanceId: parseInt(id),
				status,
				notes: notes || null,
				updatedBy: updatedBy || 'System'
			}
		});
		
		// Update the main maintenance record and asset status if needed
		const updatedMaintenance = await prisma.$transaction(async (tx) => {
			// Update maintenance record
			const maintenance = await tx.maintenanceRecord.update({
				where: { id: parseInt(id) },
				data: {
					status,
					completedDate: status === 'COMPLETED' ? new Date() : null
				},
				include: {
					asset: {
						include: {
							category: true
						}
					},
					updates: {
						orderBy: { updatedAt: 'desc' }
					}
				}
			});

			// Update asset status based on maintenance status
			if (status === 'IN_PROGRESS') {
				// Set asset status to "Maintenance" when maintenance starts
				await tx.asset.update({
					where: { id: maintenance.assetId },
					data: { status: 'Maintenance' }
				});
			} else if (status === 'COMPLETED' || status === 'CANCELLED') {
				// Set asset status to "Available" when maintenance is completed or cancelled
				await tx.asset.update({
					where: { id: maintenance.assetId },
					data: { status: 'Available' }
				});
			}

			return maintenance;
		});
		
		return json({
			success: true,
			maintenance: updatedMaintenance,
			update
		});
		
	} catch (error) {
		console.error('Error updating maintenance:', error);
		return json({ error: 'Failed to update maintenance' }, { status: 500 });
	}
}; 