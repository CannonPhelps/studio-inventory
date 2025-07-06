import { prisma } from '$lib/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('auth_session');
	if (sessionId) {
		const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
		if (session && session.expiresAt > new Date()) {
			event.locals.user = session.user;
		}
	}
	return resolve(event);
}; 