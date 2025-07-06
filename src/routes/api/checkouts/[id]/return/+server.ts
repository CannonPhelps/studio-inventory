import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const checkoutId = event.params.id;
		
		const checkout = await db.checkout.update({
			where: { id: checkoutId },
			data: {
				returnedAt: new Date()
			},
			include: {
				asset: true,
				user: true
			}
		});

		// Update asset status back to "Available"
		await db.asset.update({
			where: { id: checkout.assetId },
			data: { status: 'Available' }
		});

		return json(checkout);
	} catch (error) {
		console.error('Error returning checkout:', error);
		return json({ error: 'Failed to return checkout' }, { status: 500 });
	}
}; 