import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { AuditService } from '$lib/server/audit';
import { NotificationService } from '$lib/server/notifications';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id } = params;
		const { description, cost, status, notes } = await request.json();
		const user = locals.user;

		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Validate asset exists
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(id) },
			include: { category: true }
		});

		if (!asset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		// Create maintenance record
		const maintenanceRecord = await prisma.maintenanceRecord.create({
			data: {
				assetId: parseInt(id),
				notes: `${description || 'Repair initiated'} - Status: ${status || 'IN_PROGRESS'}${notes ? ` - ${notes}` : ''}`,
				cost: cost ? parseFloat(cost) : null,
				performedBy: user.name,
				performedAt: new Date()
			}
		});

		// Update asset status based on repair status
		let newAssetStatus = asset.status;
		if (status === 'COMPLETED') {
			newAssetStatus = 'available';
		} else if (status === 'IN_PROGRESS') {
			newAssetStatus = 'maintenance';
		}

		// Update asset
		await prisma.asset.update({
			where: { id: parseInt(id) },
			data: { status: newAssetStatus }
		});

		// Create audit log
		await AuditService.logAssetAction(
			'REPAIR_INITIATED',
			parseInt(id),
			user.id,
			{ status: asset.status },
			{ status: newAssetStatus, repairStatus: status },
			`Repair ${status.toLowerCase()} for ${asset.itemName} - Cost: ${cost || 'N/A'}`
		);

		// Create notification for admins
		await NotificationService.createNotification(
			user.id,
			'info',
			'Repair Update',
			`Repair ${status.toLowerCase()} for ${asset.itemName}`,
			'maintenance',
			{
				actionUrl: `/admin/damage-management`,
				metadata: { assetId: parseInt(id), maintenanceId: maintenanceRecord.id }
			}
		);

		return json({
			success: true,
			message: 'Repair updated successfully',
			maintenanceRecord,
			assetStatus: newAssetStatus
		});

	} catch (error) {
		console.error('Error updating repair:', error);
		return json({ error: 'Failed to update repair' }, { status: 500 });
	}
}; 