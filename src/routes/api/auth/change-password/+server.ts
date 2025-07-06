import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import { verifyPassword, hashPassword } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request, cookies }: RequestEvent) => {
	try {
		const { currentPassword, newPassword } = await request.json();

		if (!currentPassword || !newPassword) {
			return json({ error: 'Current password and new password are required' }, { status: 400 });
		}

		if (newPassword.length < 8) {
			return json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
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

		// Find user's password
		const userKey = await prisma.userKey.findFirst({
			where: { userId: session.userId }
		});

		if (!userKey?.hashedPassword) {
			return json({ error: 'User has no password set' }, { status: 400 });
		}

		// Verify current password
		const isCurrentPasswordValid = await verifyPassword(currentPassword, userKey.hashedPassword);
		if (!isCurrentPasswordValid) {
			return json({ error: 'Current password is incorrect' }, { status: 400 });
		}

		// Hash the new password
		const newHashedPassword = await hashPassword(newPassword);

		// Update the password
		await prisma.userKey.update({
			where: { id: userKey.id },
			data: { hashedPassword: newHashedPassword }
		});

		// Delete all sessions for this user to force re-login
		await prisma.userSession.deleteMany({
			where: { userId: session.userId }
		});

		// Clear the session cookie
		cookies.delete('auth_session', { path: '/' });

		return json({ message: 'Password changed successfully. Please log in again.' });
	} catch (error) {
		console.error('Password change error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 