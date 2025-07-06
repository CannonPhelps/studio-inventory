import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const bulkCables = await db.bulkCable.findMany({
			include: {
				cableType: true
			},
			orderBy: { id: 'desc' }
		});
		return json(bulkCables);
	} catch (error) {
		console.error('Error fetching bulk cables:', error);
		return json({ error: 'Failed to fetch bulk cables' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const body = await event.request.json();
		const { cableTypeId, totalLength, remainingLength, location, supplier, purchaseDate, purchasePrice, notes } = body;

		if (!cableTypeId || !totalLength) {
			return json({ error: 'Cable type and total length are required' }, { status: 400 });
		}

		const bulkCable = await db.bulkCable.create({
			data: {
				cableTypeId: parseInt(cableTypeId),
				totalLength: parseFloat(totalLength),
				remainingLength: remainingLength ? parseFloat(remainingLength) : parseFloat(totalLength),
				location,
				supplier,
				purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
				purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
				notes
			},
			include: {
				cableType: true
			}
		});

		return json(bulkCable, { status: 201 });
	} catch (error) {
		console.error('Error creating bulk cable:', error);
		return json({ error: 'Failed to create bulk cable' }, { status: 500 });
	}
};

 