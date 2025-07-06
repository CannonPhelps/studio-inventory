import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import { verifyPassword } from '$lib/server/auth';
import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';

const SESSION_COOKIE = 'auth_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});

		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Find user key with password
		const key = await prisma.userKey.findFirst({
			where: { userId: user.id }
		});

		if (!key?.hashedPassword) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Verify password
		const isValidPassword = await verifyPassword(password, key.hashedPassword);
		if (!isValidPassword) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Create session
		const sessionId = randomBytes(32).toString('hex');
		const expiresAt = new Date(Date.now() + SESSION_TTL * 1000);
		await prisma.userSession.create({
			data: {
				id: sessionId,
				userId: user.id,
				expiresAt
			}
		});
		cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: SESSION_TTL
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				department: user.department,
				phone: user.phone
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 