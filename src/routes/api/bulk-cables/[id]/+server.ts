import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid bulk cable ID' }, { status: 400 });
		}

		const bulkCable = await db.bulkCable.findUnique({
			where: { id },
			include: {
				cableType: true
			}
		});

		if (!bulkCable) {
			return json({ error: 'Bulk cable not found' }, { status: 404 });
		}

		return json(bulkCable);
	} catch (error) {
		console.error('Error fetching bulk cable:', error);
		return json({ error: 'Failed to fetch bulk cable' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		const body = await request.json();
		
		if (!id) {
			return json({ error: 'Invalid bulk cable ID' }, { status: 400 });
		}

		const { cableTypeId, totalLength, remainingLength, location, supplier, purchaseDate, purchasePrice, notes } = body;

		if (!cableTypeId || !totalLength) {
			return json({ error: 'Cable type and total length are required' }, { status: 400 });
		}

		const bulkCable = await db.bulkCable.update({
			where: { id },
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

		return json(bulkCable);
	} catch (error) {
		console.error('Error updating bulk cable:', error);
		return json({ error: 'Failed to update bulk cable' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid bulk cable ID' }, { status: 400 });
		}

		await db.bulkCable.delete({
			where: { id }
		});

		return json({ message: 'Bulk cable deleted successfully' });
	} catch (error) {
		console.error('Error deleting bulk cable:', error);
		return json({ error: 'Failed to delete bulk cable' }, { status: 500 });
	}
}; 