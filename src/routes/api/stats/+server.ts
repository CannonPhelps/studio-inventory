import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const [totalAssets, availableAssets, checkedOutAssets, maintenanceNeeded, damagedAssets, totalUsers, activeCheckouts, categories, cableTypes] = await Promise.all([
			prisma.asset.count(),
			prisma.asset.count({ where: { status: 'Available' } }),
			prisma.asset.count({ where: { status: 'In Use' } }),
			prisma.asset.count({ where: { status: 'Maintenance' } }),
			prisma.asset.count({ where: { status: { in: ['Damaged', 'Broken'] } } }),
			prisma.user.count(),
			prisma.checkout.count({ where: { returnedAt: null } }),
			prisma.category.count(),
			prisma.cableType.count()
		]);

		// Get recent activity including damage reports
		const [recentCheckouts, recentDamageReports] = await Promise.all([
			prisma.checkout.findMany({
				include: {
					asset: true
				},
				orderBy: { checkoutAt: 'desc' },
				take: 3
			}),
			prisma.maintenanceRecord.findMany({
				where: {
					notes: {
						contains: 'Damage reported'
					}
				},
				include: {
					asset: true
				},
				orderBy: { performedAt: 'desc' },
				take: 3
			})
		]);

		// Transform recent activity to match expected format
		const transformedCheckouts = recentCheckouts.map(checkout => ({
			type: 'checkout',
			description: `${checkout.user} checked out ${checkout.asset.itemName}`,
			timestamp: checkout.checkoutAt.toLocaleDateString(),
			status: checkout.returnedAt ? 'completed' : 'pending'
		}));

		const transformedDamageReports = recentDamageReports.map(record => ({
			type: 'damage',
			description: `Damage reported for ${record.asset.itemName}`,
			timestamp: record.performedAt.toLocaleDateString(),
			status: 'reported'
		}));

		// Combine and sort by timestamp
		const recentActivity = [...transformedCheckouts, ...transformedDamageReports]
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
			.slice(0, 5);

		return json({
			totalAssets,
			availableAssets,
			checkedOutAssets,
			maintenanceNeeded: maintenanceNeeded + damagedAssets, // Include damaged assets in maintenance count
			damagedAssets,
			totalUsers,
			activeCheckouts,
			categories,
			cableTypes,
			recentActivity
		});
	} catch (error) {
		console.error('Error fetching stats:', error);
		return json({ error: 'Failed to fetch stats' }, { status: 500 });
	}
}; 