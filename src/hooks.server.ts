import { prisma } from '$lib/db';
import { TaskRunner } from '$lib/server/tasks';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Ensure automated tasks are initialized on first request
	await TaskRunner.init();
	const sessionId = event.cookies.get('auth_session');
	if (sessionId) {
		const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
		if (session && session.expiresAt > new Date()) {
			event.locals.user = session.user;
		}
	}
	return resolve(event);
}; 