import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

const SESSION_COOKIE = 'auth_session';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) return json({ user: null });
	const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
	if (!session || session.expiresAt < new Date()) return json({ user: null });
	const { user } = session;
	return json({ user: {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		department: user.department,
		phone: user.phone
	} });
}; 