import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const cableEnds = await db.cableEnd.findMany({
			orderBy: { name: 'asc' }
		});
		return json(cableEnds);
	} catch (error) {
		console.error('Error fetching cable ends:', error);
		return json({ error: 'Failed to fetch cable ends' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const body = await event.request.json();
		const { 
			name, 
			type, 
			gender, 
			description, 
			color, 
			quantity = 0, 
			purchasePrice, 
			supplier, 
			purchaseDate, 
			location, 
			notes 
		} = body;

		if (!name || !type || !gender) {
			return json({ error: 'Name, type, and gender are required' }, { status: 400 });
		}

		const cableEnd = await db.cableEnd.create({
			data: {
				name,
				type,
				gender,
				description,
				color,
				quantity: parseInt(quantity) || 0,
				purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
				supplier,
				purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
				location,
				notes
			}
		});

		return json(cableEnd, { status: 201 });
	} catch (error) {
		console.error('Error creating cable end:', error);
		return json({ error: 'Failed to create cable end' }, { status: 500 });
	}
}; 