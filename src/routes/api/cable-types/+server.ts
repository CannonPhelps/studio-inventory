import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async () => {
	try {
		const cableTypes = await db.cableType.findMany({
			orderBy: { name: 'asc' }
		});
		return json(cableTypes);
	} catch (error) {
		console.error('Error fetching cable types:', error);
		return json({ error: 'Failed to fetch cable types' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, description, color, gauge, impedance, maxLength } = body;

		if (!name) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		const cableType = await db.cableType.create({
			data: {
				name,
				description,
				color,
				gauge,
				impedance,
				maxLength: maxLength ? parseFloat(maxLength) : null
			}
		});

		return json(cableType, { status: 201 });
	} catch (error) {
		console.error('Error creating cable type:', error);
		return json({ error: 'Failed to create cable type' }, { status: 500 });
	}
}; 