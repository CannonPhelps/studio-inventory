import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const [totalAssets, availableAssets, checkedOutAssets, maintenanceNeeded, totalUsers, activeCheckouts, categories, cableTypes] = await Promise.all([
			prisma.asset.count(),
			prisma.asset.count({ where: { status: 'Available' } }),
			prisma.asset.count({ where: { status: 'Checked Out' } }),
			prisma.asset.count({ where: { status: 'Maintenance' } }),
			prisma.user.count(),
			prisma.checkout.count({ where: { returnedAt: null } }),
			prisma.category.count(),
			prisma.cableType.count()
		]);

		const recentActivity = await prisma.checkout.findMany({
			include: {
				asset: true
			},
			orderBy: { checkoutAt: 'desc' },
			take: 5
		});

		// Transform recent activity to match expected format
		const transformedActivity = recentActivity.map(checkout => ({
			type: 'checkout',
			description: `${checkout.user} checked out ${checkout.asset.itemName}`,
			timestamp: checkout.checkoutAt.toLocaleDateString(),
			status: checkout.returnedAt ? 'completed' : 'pending'
		}));

		return json({
			totalAssets,
			availableAssets,
			checkedOutAssets,
			maintenanceNeeded,
			totalUsers,
			activeCheckouts,
			categories,
			cableTypes,
			recentActivity: transformedActivity
		});
	} catch (error) {
		console.error('Error fetching stats:', error);
		return json({ error: 'Failed to fetch stats' }, { status: 500 });
	}
}; 