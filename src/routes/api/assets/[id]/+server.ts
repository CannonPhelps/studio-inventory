import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		const assetId = parseInt(event.params.id);
		const updateData = await event.request.json();

		// Check if asset exists
		const existingAsset = await prisma.asset.findUnique({
			where: { id: assetId }
		});

		if (!existingAsset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		// Prepare update data
		const data: {
			itemName: string;
			quantity: number;
			categoryId: number;
			modelBrand?: string | null;
			serialNumber?: string | null;
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
			serialNumber: updateData.serialNumber || null,
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

		// Update asset
		const updatedAsset = await prisma.asset.update({
			where: { id: assetId },
			data,
			include: {
				category: true,
				cableType: true
			}
		});

		return json(updatedAsset);
	} catch (error) {
		console.error('Update asset error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

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