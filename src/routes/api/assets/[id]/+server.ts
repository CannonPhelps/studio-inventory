import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import { AuditService } from '$lib/server/audit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		const user = await requireAdmin(event);

		const assetId = parseInt(event.params.id);
		const updateData = await event.request.json();

		// Check if asset exists
		const existingAsset = await prisma.asset.findUnique({
			where: { id: assetId },
			include: { serialNumbers: true }
		});

		if (!existingAsset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		// Handle serial numbers update
		const serialNumbers = updateData.serialNumbers || [];
		const serialNumbersData = Array.isArray(serialNumbers) 
			? serialNumbers.filter(sn => sn && sn.trim())
			: (updateData.serialNumber && updateData.serialNumber.trim() ? [updateData.serialNumber] : []);

		// Prepare update data
		const data: {
			itemName: string;
			quantity: number;
			categoryId: number;
			modelBrand?: string | null;
			location?: string | null;
			status: string;
			notes?: string | null;
			assigned?: string | null;
			assetNumber?: string | null;
			supplier?: string | null;
			isCable: boolean;
			purchaseDate?: Date;
			purchasePrice?: number;
			cableTypeId?: number;
			cableLength?: number;
		} = {
			itemName: updateData.itemName,
			quantity: parseInt(updateData.quantity) || 1,
			categoryId: updateData.categoryId ? parseInt(updateData.categoryId) : 1,
			modelBrand: updateData.modelBrand || null,
			location: updateData.location || null,
			status: updateData.status,
			notes: updateData.notes || null,
			assigned: updateData.assigned || null,
			assetNumber: updateData.assetNumber || null,
			supplier: updateData.supplier || null,
			isCable: updateData.isCable || false
		};

		// Handle optional fields
		if (updateData.purchaseDate) {
			data.purchaseDate = new Date(updateData.purchaseDate);
		}
		if (updateData.purchasePrice && updateData.purchasePrice !== '') {
			data.purchasePrice = parseFloat(updateData.purchasePrice);
		}
		if (updateData.cableTypeId && updateData.cableTypeId !== '') {
			data.cableTypeId = parseInt(updateData.cableTypeId);
		}
		if (updateData.cableLength && updateData.cableLength !== '') {
			data.cableLength = parseFloat(updateData.cableLength);
		}

		// Update asset and serial numbers
		const updatedAsset = await prisma.asset.update({
			where: { id: assetId },
			data: {
				...data,
				serialNumbers: {
					deleteMany: {},
					create: serialNumbersData.map(sn => ({ serialNumber: sn }))
				}
			},
			include: {
				category: true,
				cableType: true,
				serialNumbers: true
			}
		});

		// Log the asset update
		await AuditService.logAssetAction(
			'UPDATE',
			assetId,
			user.id,
			{ itemName: existingAsset.itemName, status: existingAsset.status },
			{ itemName: updatedAsset.itemName, status: updatedAsset.status },
			`Asset "${updatedAsset.itemName}" updated`,
			event
		);

		return json(updatedAsset);
	} catch (error) {
		console.error('Update asset error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		const user = await requireAdmin(event);

		const assetId = parseInt(event.params.id);

		// Check if asset exists
		const existingAsset = await prisma.asset.findUnique({
			where: { id: assetId }
		});

		if (!existingAsset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		// Check if asset has active checkouts
		const activeCheckouts = await prisma.checkout.findMany({
			where: {
				assetId: assetId,
				returnedAt: null
			}
		});

		if (activeCheckouts.length > 0) {
			return json({ 
				error: 'Cannot delete asset with active checkouts. Please return all items first.' 
			}, { status: 400 });
		}

		// Delete related records first
		await prisma.checkout.deleteMany({
			where: { assetId: assetId }
		});

		await prisma.maintenanceRecord.deleteMany({
			where: { assetId: assetId }
		});

		await prisma.movement.deleteMany({
			where: { assetId: assetId }
		});

		// Log the asset deletion
		await AuditService.logAssetAction(
			'DELETE',
			assetId,
			user.id,
			{ itemName: existingAsset.itemName, status: existingAsset.status },
			undefined,
			`Asset "${existingAsset.itemName}" deleted`,
			event
		);

		// Delete asset
		await prisma.asset.delete({
			where: { id: assetId }
		});

		return json({ message: 'Asset deleted successfully' });
	} catch (error) {
		console.error('Delete asset error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 