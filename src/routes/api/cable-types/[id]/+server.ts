import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid cable type ID' }, { status: 400 });
		}

		const cableType = await db.cableType.findUnique({
			where: { id }
		});

		if (!cableType) {
			return json({ error: 'Cable type not found' }, { status: 404 });
		}

		return json(cableType);
	} catch (error) {
		console.error('Error fetching cable type:', error);
		return json({ error: 'Failed to fetch cable type' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		const body = await request.json();
		
		if (!id) {
			return json({ error: 'Invalid cable type ID' }, { status: 400 });
		}

		const { name, description, color, gauge, impedance, maxLength } = body;

		if (!name) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		const cableType = await db.cableType.update({
			where: { id },
			data: {
				name,
				description,
				color,
				gauge,
				impedance,
				maxLength: maxLength ? parseFloat(maxLength) : null
			}
		});

		return json(cableType);
	} catch (error) {
		console.error('Error updating cable type:', error);
		return json({ error: 'Failed to update cable type' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		
		if (!id) {
			return json({ error: 'Invalid cable type ID' }, { status: 400 });
		}

		// Check if cable type is being used by any bulk cables
		const bulkCablesUsingType = await db.bulkCable.findFirst({
			where: { cableTypeId: id }
		});

		if (bulkCablesUsingType) {
			return json({ 
				error: 'Cannot delete cable type that is being used by bulk cables' 
			}, { status: 400 });
		}

		// Check if cable type is being used by any cable assemblies
		const cableAssembliesUsingType = await db.cableAssembly.findFirst({
			where: { cableTypeId: id }
		});

		if (cableAssembliesUsingType) {
			return json({ 
				error: 'Cannot delete cable type that is being used by cable assemblies' 
			}, { status: 400 });
		}

		await db.cableType.delete({
			where: { id }
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting cable type:', error);
		return json({ error: 'Failed to delete cable type' }, { status: 500 });
	}
}; 