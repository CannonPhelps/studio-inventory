import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestEvent } from '@sveltejs/kit';

export async function requireAuth(event: RequestEvent) {
	const sessionId = event.cookies.get('auth_session');
	if (!sessionId) {
		throw redirect(302, '/login');
	}
	const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
	if (!session || session.expiresAt < new Date() || !session.user) {
		throw redirect(302, '/login');
	}
	return session.user;
}

export async function requireAdmin(event: RequestEvent) {
	const user = await requireAuth(event);
	if (user.role !== 'admin') {
		throw redirect(302, '/');
	}
	return user;
}

export async function optionalAuth(event: RequestEvent) {
	const sessionId = event.cookies.get('auth_session');
	if (!sessionId) {
		return null;
	}
	const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
	if (!session || session.expiresAt < new Date() || !session.user) {
		return null;
	}
	return session.user;
} 