import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		// Check if current user is admin
		await requireAdmin(event);

		// Get all users
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				department: true,
				phone: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return json(users);
	} catch (error) {
		console.error('Get users error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 