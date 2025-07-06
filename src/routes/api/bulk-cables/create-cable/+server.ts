import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { requireAuth } from '$lib/server/routeProtection';

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const { bulkCableId, length, customName, endAId, endBId } = await event.request.json();

		if (!bulkCableId || !length || !endAId || !endBId) {
			return json({ 
				error: 'Bulk cable ID, length, and both ends are required' 
			}, { status: 400 });
		}

		// Get the bulk cable and check if there's enough remaining length
		const bulkCable = await prisma.bulkCable.findUnique({
			where: { id: bulkCableId },
			include: { cableType: true }
		});

		if (!bulkCable) {
			return json({ error: 'Bulk cable not found' }, { status: 404 });
		}

		const requestedLength = parseFloat(length);
		if (bulkCable.remainingLength < requestedLength) {
			return json({ 
				error: `Not enough cable remaining. Available: ${bulkCable.remainingLength}ft, Requested: ${requestedLength}ft` 
			}, { status: 400 });
		}

		// Calculate proportional cost based on bulk cable
		let calculatedCost = null;
		if (bulkCable.purchasePrice && bulkCable.totalLength) {
			const costPerFoot = parseFloat(bulkCable.purchasePrice.toString()) / bulkCable.totalLength;
			calculatedCost = costPerFoot * requestedLength;
		}

		// Get connector costs
		const endA = await prisma.cableEnd.findUnique({
			where: { id: parseInt(endAId) }
		});
		const endB = await prisma.cableEnd.findUnique({
			where: { id: parseInt(endBId) }
		});

		if (!endA || !endB) {
			return json({ error: 'One or both cable ends not found' }, { status: 404 });
		}

		// Check if we have enough connectors in inventory
		if (endA.quantity < 1 || endB.quantity < 1) {
			return json({ 
				error: `Insufficient connector inventory. Need: ${endA.name} (${endA.quantity} available), ${endB.name} (${endB.quantity} available)` 
			}, { status: 400 });
		}

		// Calculate total cost including connectors
		let totalCost = calculatedCost || 0;
		if (endA.purchasePrice) {
			totalCost += parseFloat(endA.purchasePrice.toString());
		}
		if (endB.purchasePrice) {
			totalCost += parseFloat(endB.purchasePrice.toString());
		}

		// Create the cable assembly, asset, and reduce bulk cable length in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create the cable assembly
			const cableAssembly = await tx.cableAssembly.create({
				data: {
					cableTypeId: bulkCable.cableTypeId,
					endAId: parseInt(endAId),
					endBId: parseInt(endBId),
					length: parseFloat(length),
					customName: customName || null
				},
				include: {
					cableType: true,
					endA: true,
					endB: true
				}
			});

			// Find the Cable category or use the first category as fallback
			const cableCategory = await tx.category.findFirst({
				where: { name: { equals: 'Cable', mode: 'insensitive' } }
			});
			
			// Create the asset record
			const assetName = customName || `${bulkCable.cableType.name} ${requestedLength}ft`;
			const asset = await tx.asset.create({
				data: {
					itemName: assetName,
					quantity: 1,
					categoryId: cableCategory?.id || 1, // Use Cable category if found, otherwise first category
					cableTypeId: bulkCable.cableTypeId,
					cableLength: requestedLength,
					purchasePrice: totalCost,
					purchaseDate: bulkCable.purchaseDate,
					supplier: bulkCable.supplier,
					location: bulkCable.location,
					status: 'Available',
					isCable: true,
					notes: `Created from bulk cable #${bulkCable.id} with connectors: ${endA.name} + ${endB.name}`
				},
				include: {
					category: true,
					cableType: true
				}
			});

			// Reduce connector inventory
			await tx.cableEnd.update({
				where: { id: parseInt(endAId) },
				data: { quantity: endA.quantity - 1 }
			});
			await tx.cableEnd.update({
				where: { id: parseInt(endBId) },
				data: { quantity: endB.quantity - 1 }
			});

			// Link the assembly to the asset
			await tx.cableAssembly.update({
				where: { id: cableAssembly.id },
				data: { assetId: asset.id }
			});

			// Reduce the remaining length of the bulk cable
			await tx.bulkCable.update({
				where: { id: bulkCableId },
				data: {
					remainingLength: bulkCable.remainingLength - requestedLength
				}
			});

			return { cableAssembly, asset };
		});

		const connectorCosts = {
			endA: { name: endA.name, cost: endA.purchasePrice ? parseFloat(endA.purchasePrice.toString()) : 0 },
			endB: { name: endB.name, cost: endB.purchasePrice ? parseFloat(endB.purchasePrice.toString()) : 0 }
		};

		return json({
			success: true,
			cableAssembly: result.cableAssembly,
			asset: result.asset,
			cableCost: calculatedCost,
			connectorCosts,
			totalCost,
			remainingLength: bulkCable.remainingLength - requestedLength
		});

	} catch (error) {
		console.error('Error creating cable from bulk:', error);
		return json({ 
			error: 'Failed to create cable from bulk cable' 
		}, { status: 500 });
	}
}; 