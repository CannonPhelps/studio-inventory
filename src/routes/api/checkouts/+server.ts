import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const checkouts = await prisma.checkout.findMany({
			include: {
				asset: true
			},
			orderBy: { checkoutAt: 'desc' }
		});

		return json(checkouts);
	} catch (error) {
		console.error('Error fetching checkouts:', error);
		return json({ error: 'Failed to fetch checkouts' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		const user = await requireAuth(event);
		
		const data = await event.request.json();
		
		const checkout = await prisma.checkout.create({
			data: {
				assetId: data.assetId,
				user: user.name,
				checkoutAt: new Date(),
				dueAt: data.expectedReturnDate ? new Date(data.expectedReturnDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
				notes: data.notes
			},
			include: {
				asset: true
			}
		});

		// Update asset status to "Checked Out"
		await prisma.asset.update({
			where: { id: data.assetId },
			data: { status: 'Checked Out' }
		});

		return json(checkout);
	} catch (error) {
		console.error('Error creating checkout:', error);
		return json({ error: 'Failed to create checkout' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const { checkoutId, notes } = await request.json();
		
		if (!checkoutId) {
			return json({ error: 'Checkout ID is required' }, { status: 400 });
		}

		// Update checkout and asset status
		const result = await prisma.$transaction(async (tx) => {
			// First get the current checkout to access its notes
			const currentCheckout = await tx.checkout.findUnique({
				where: { id: parseInt(checkoutId) }
			});

			if (!currentCheckout) {
				throw new Error('Checkout not found');
			}

			const checkout = await tx.checkout.update({
				where: { id: parseInt(checkoutId) },
				data: {
					returnedAt: new Date(),
					notes: notes ? `${currentCheckout.notes || ''}\nReturn notes: ${notes}`.trim() : currentCheckout.notes
				},
				include: {
					asset: true
				}
			});

			await tx.asset.update({
				where: { id: checkout.assetId },
				data: { status: 'Available' }
			});

			return checkout;
		});

		return json(result);
	} catch (error) {
		console.error('Error updating checkout:', error);
		return json({ error: 'Failed to update checkout' }, { status: 500 });
	}
}; 