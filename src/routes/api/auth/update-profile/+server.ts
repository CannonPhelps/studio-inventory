import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestEvent } from '@sveltejs/kit';

export const PUT = async ({ request, cookies }: RequestEvent) => {
	try {
		const { name, email, department, phone } = await request.json();

		if (!name || !email) {
			return json({ error: 'Name and email are required' }, { status: 400 });
		}

		// Get the session from cookies
		const sessionId = cookies.get('auth_session');
		if (!sessionId) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		// Find the session and user
		const session = await prisma.userSession.findUnique({
			where: { id: sessionId },
			include: { user: true }
		});

		if (!session || session.expiresAt < new Date()) {
			return json({ error: 'Session expired' }, { status: 401 });
		}

		// Check if email is already taken by another user
		const existingUser = await prisma.user.findFirst({
			where: {
				email: email.toLowerCase(),
				id: { not: session.userId }
			}
		});

		if (existingUser) {
			return json({ error: 'Email address is already in use' }, { status: 400 });
		}

		// Update the user profile
		const updatedUser = await prisma.user.update({
			where: { id: session.userId },
			data: {
				name,
				email: email.toLowerCase(),
				department: department || null,
				phone: phone || null
			}
		});

		return json({
			message: 'Profile updated successfully',
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				name: updatedUser.name,
				role: updatedUser.role,
				department: updatedUser.department,
				phone: updatedUser.phone
			}
		});
	} catch (error) {
		console.error('Profile update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 