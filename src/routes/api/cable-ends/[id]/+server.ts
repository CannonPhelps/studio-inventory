import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid cable end ID' }, { status: 400 });
		}

		const cableEnd = await db.cableEnd.findUnique({
			where: { id }
		});

		if (!cableEnd) {
			return json({ error: 'Cable end not found' }, { status: 404 });
		}

		return json(cableEnd);
	} catch (error) {
		console.error('Error fetching cable end:', error);
		return json({ error: 'Failed to fetch cable end' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		const body = await request.json();
		
		if (!id) {
			return json({ error: 'Invalid cable end ID' }, { status: 400 });
		}

		const { 
			name, 
			type, 
			gender, 
			description, 
			color, 
			quantity, 
			purchasePrice, 
			supplier, 
			purchaseDate, 
			location, 
			notes 
		} = body;

		if (!name || !type || !gender) {
			return json({ error: 'Name, type, and gender are required' }, { status: 400 });
		}

		const cableEnd = await db.cableEnd.update({
			where: { id },
			data: {
				name,
				type,
				gender,
				description,
				color,
				quantity: quantity !== undefined ? parseInt(quantity) : undefined,
				purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : undefined,
				supplier,
				purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
				location,
				notes
			}
		});

		return json(cableEnd);
	} catch (error) {
		console.error('Error updating cable end:', error);
		return json({ error: 'Failed to update cable end' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid cable end ID' }, { status: 400 });
		}

		await db.cableEnd.delete({
			where: { id }
		});

		return json({ message: 'Cable end deleted successfully' });
	} catch (error) {
		console.error('Error deleting cable end:', error);
		return json({ error: 'Failed to delete cable end' }, { status: 500 });
	}
}; 