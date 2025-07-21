import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		// Require admin authentication
		const admin = await requireAdmin(event);
		
		const data = await event.request.json();
		
		// Validate required fields
		if (!data.assetId || !data.userId) {
			return json({ error: 'Asset ID and User ID are required' }, { status: 400 });
		}

		// Get the user to check out for
		const user = await prisma.user.findUnique({
			where: { id: data.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check if asset exists and is available
		const asset = await prisma.asset.findUnique({
			where: { id: parseInt(data.assetId) }
		});

		if (!asset) {
			return json({ error: 'Asset not found' }, { status: 404 });
		}

		if (asset.status !== 'Available') {
			return json({ error: 'Asset is not available for checkout' }, { status: 400 });
		}

		// Create checkout
		const checkout = await prisma.checkout.create({
			data: {
				assetId: parseInt(data.assetId),
				user: user.name, // Use the user's name for the checkout
				checkoutAt: new Date(),
				dueAt: data.expectedReturnDate ? new Date(data.expectedReturnDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
				notes: data.notes ? `Admin checkout by ${admin.name}: ${data.notes}` : `Admin checkout by ${admin.name}`
			},
			include: {
				asset: true
			}
		});

		// Update asset status to "Checked Out"
		await prisma.asset.update({
			where: { id: parseInt(data.assetId) },
			data: { status: 'Checked Out' }
		});

		// Create audit log entry
		await prisma.auditLog.create({
			data: {
				action: 'ADMIN_CHECKOUT',
				entityType: 'ASSET',
				entityId: data.assetId.toString(),
				userId: admin.id,
				details: JSON.stringify({
					assetName: asset.itemName,
					checkedOutFor: user.name,
					dueDate: checkout.dueAt,
					notes: data.notes
				}),
				ipAddress: event.getClientAddress() || 'unknown'
			}
		});

		return json({
			message: 'Checkout created successfully',
			checkout
		});
	} catch (error) {
		console.error('Error creating admin checkout:', error);
		return json({ error: 'Failed to create checkout' }, { status: 500 });
	}
}; 