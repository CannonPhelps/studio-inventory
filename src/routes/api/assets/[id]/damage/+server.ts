import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import { AuditService } from '$lib/server/audit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		const user = await requireAuth(event);
		
		const assetId = parseInt(event.params.id);
		const damageData = await event.request.json();

		// Check if asset exists
		const existingAsset = await prisma.asset.findUnique({
			where: { id: assetId },
			include: { category: true }
		});

		if (!existingAsset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		// Determine new status based on severity
		let newStatus = existingAsset.status;
		switch (damageData.severity) {
			case 'minor':
				newStatus = 'Damaged';
				break;
			case 'moderate':
				newStatus = 'Damaged';
				break;
			case 'major':
				newStatus = 'Damaged';
				break;
			case 'broken':
				newStatus = 'Broken';
				break;
			default:
				newStatus = 'Damaged';
		}

		// Update asset status
		const updatedAsset = await prisma.asset.update({
			where: { id: assetId },
			data: {
				status: newStatus,
				location: damageData.location || existingAsset.location
			},
			include: {
				category: true,
				serialNumbers: true
			}
		});

		// Create maintenance record for the damage
		const maintenanceRecord = await prisma.maintenanceRecord.create({
			data: {
				assetId: assetId,
				performedBy: user.id,
				performedAt: new Date(),
				cost: 0, // Damage reports don't have immediate costs
				notes: `Damage reported by ${user.email}. Severity: ${damageData.severity}. Location: ${damageData.location}. Description: ${damageData.description}`
			}
		});

		// Log the damage report
		await AuditService.logAssetAction(
			'DAMAGE_REPORT',
			assetId,
			user.id,
			{ status: existingAsset.status },
			{ status: newStatus, severity: damageData.severity },
			`Damage reported for "${existingAsset.itemName}" - ${damageData.severity} severity`,
			event
		);

		// Create notification for admins (if notification system exists)
		try {
			await prisma.notification.create({
				data: {
					userId: user.id, // Use the current user's ID
					title: 'Equipment Damage Reported',
					message: `Asset "${existingAsset.itemName}" has been reported as damaged. Severity: ${damageData.severity}`,
					type: 'DAMAGE_REPORT',
					category: 'MAINTENANCE',
					read: false
				}
			});
		} catch (notificationError) {
			console.warn('Could not create notification:', notificationError);
		}

		return json({
			asset: updatedAsset,
			maintenanceRecord: maintenanceRecord,
			message: 'Damage reported successfully'
		});
	} catch (error) {
		console.error('Error reporting damage:', error);
		return json(
			{ error: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}; 