import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const returns = await prisma.checkout.findMany({
			where: {
				returnedAt: {
					not: null
				}
			},
			include: {
				asset: true
			},
			orderBy: { returnedAt: 'desc' }
		});

		return json(returns);
	} catch (error) {
		console.error('Error fetching returns:', error);
		return json({ error: 'Failed to fetch returns' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const data = await event.request.json();
		
		if (!data.checkoutId) {
			return json({ error: 'Checkout ID is required' }, { status: 400 });
		}

		// Update checkout to mark as returned
		const checkout = await prisma.checkout.update({
			where: { id: parseInt(data.checkoutId) },
			data: {
				returnedAt: new Date(),
				notes: data.notes ? `${data.notes}` : undefined
			},
			include: {
				asset: true
			}
		});

		// Update asset status to "Available"
		await prisma.asset.update({
			where: { id: checkout.assetId },
			data: { status: 'Available' }
		});

		return json(checkout);
	} catch (error) {
		console.error('Error processing return:', error);
		return json({ error: 'Failed to process return' }, { status: 500 });
	}
}; 