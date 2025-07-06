import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionId = cookies.get('auth_session');
		
		console.log('Test endpoint - Session ID:', sessionId);
		
		if (!sessionId) {
			return json({ 
				authenticated: false, 
				message: 'No session found',
				cookies: cookies.getAll()
			});
		}

		const session = await prisma.userSession.findUnique({ 
			where: { id: sessionId }, 
			include: { user: true } 
		});
		
		if (!session || session.expiresAt < new Date() || !session.user) {
			return json({ 
				authenticated: false, 
				message: 'Invalid or expired session'
			});
		}
		
		console.log('Test endpoint - User:', session.user);
		
		return json({ 
			authenticated: true,
			user: {
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
				role: session.user.role,
				department: session.user.department,
				phone: session.user.phone
			},
			session: {
				id: session.id,
				expiresAt: session.expiresAt
			}
		});
	} catch (error) {
		console.error('Test endpoint error:', error);
		return json({ 
			authenticated: false, 
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}; 