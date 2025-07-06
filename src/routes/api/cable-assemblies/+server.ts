import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';

export const GET: RequestHandler = async () => {
	try {
		const cableAssemblies = await db.cableAssembly.findMany({
			include: {
				cableType: true,
				endA: true,
				endB: true,
				asset: true
			},
			orderBy: { id: 'desc' }
		});
		return json(cableAssemblies);
	} catch (error) {
		console.error('Error fetching cable assemblies:', error);
		return json({ error: 'Failed to fetch cable assemblies' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { cableTypeId, endAId, endBId, length, customName, assetId } = body;

		if (!cableTypeId || !endAId || !endBId || !length) {
			return json({ error: 'Cable type, both ends, and length are required' }, { status: 400 });
		}

		const cableAssembly = await db.cableAssembly.create({
			data: {
				cableTypeId: parseInt(cableTypeId),
				endAId: parseInt(endAId),
				endBId: parseInt(endBId),
				length: parseFloat(length),
				customName,
				assetId: assetId ? parseInt(assetId) : null
			},
			include: {
				cableType: true,
				endA: true,
				endB: true,
				asset: true
			}
		});

		return json(cableAssembly, { status: 201 });
	} catch (error) {
		console.error('Error creating cable assembly:', error);
		return json({ error: 'Failed to create cable assembly' }, { status: 500 });
	}
}; 