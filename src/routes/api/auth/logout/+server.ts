import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

const SESSION_COOKIE = 'auth_session';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await prisma.userSession.deleteMany({ where: { id: sessionId } });
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
	return json({ success: true });
}; 