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
		if (!data.checkoutId) {
			return json({ error: 'Checkout ID is required' }, { status: 400 });
		}

		// Get the checkout to return
		const checkout = await prisma.checkout.findUnique({
			where: { id: parseInt(data.checkoutId) },
			include: {
				asset: true
			}
		});

		if (!checkout) {
			return json({ error: 'Checkout not found' }, { status: 404 });
		}

		if (checkout.returnedAt) {
			return json({ error: 'Checkout has already been returned' }, { status: 400 });
		}

		// Update checkout and asset status
		const result = await prisma.$transaction(async (tx) => {
			// Update checkout with return information
			const updatedCheckout = await tx.checkout.update({
				where: { id: parseInt(data.checkoutId) },
				data: {
					returnedAt: new Date(),
					notes: data.notes ? 
						`${checkout.notes || ''}\nAdmin return by ${admin.name} - Condition: ${data.condition} - Notes: ${data.notes}`.trim() :
						`${checkout.notes || ''}\nAdmin return by ${admin.name} - Condition: ${data.condition}`.trim()
				},
				include: {
					asset: true
				}
			});

			// Update asset status back to "Available"
			await tx.asset.update({
				where: { id: checkout.assetId },
				data: { status: 'Available' }
			});

			return updatedCheckout;
		});

		// Create audit log entry
		await prisma.auditLog.create({
			data: {
				action: 'ADMIN_RETURN',
				entityType: 'ASSET',
				entityId: checkout.assetId.toString(),
				userId: admin.id,
				details: JSON.stringify({
					assetName: checkout.asset?.itemName,
					returnedFor: checkout.user,
					condition: data.condition,
					notes: data.notes,
					checkoutId: checkout.id.toString()
				}),
				ipAddress: event.getClientAddress() || 'unknown'
			}
		});

		return json({
			message: 'Return processed successfully',
			checkout: result
		});
	} catch (error) {
		console.error('Error processing admin return:', error);
		return json({ error: 'Failed to process return' }, { status: 500 });
	}
}; 