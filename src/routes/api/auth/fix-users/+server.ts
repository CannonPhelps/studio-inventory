import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		// Find all users that don't have UserKey records
		const usersWithoutKeys = await prisma.user.findMany({
			where: {
				keys: {
					none: {}
				}
			}
		});

		let fixedCount = 0;

		for (const user of usersWithoutKeys) {
			// Create UserKey record for each user
			await prisma.userKey.create({
				data: {
					id: `email:${user.email}`,
					userId: user.id,
					hashedPassword: user.passwordHash
				}
			});
			fixedCount++;
		}

		return json({
			message: `Fixed ${fixedCount} users`,
			fixedCount,
			totalUsers: usersWithoutKeys.length
		});
	} catch (error) {
		console.error('Fix users error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 