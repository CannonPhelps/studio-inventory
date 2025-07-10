import { optionalAuth } from '$lib/server/routeProtection';
import { prisma } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async (event: RequestEvent) => {
	// Check if we're on the onboarding page
	const isOnboarding = event.url.pathname === '/onboarding';
	
	// Check if any users exist
	const userCount = await prisma.user.count();
	
	// If no users exist and we're not on onboarding, redirect to onboarding
	if (userCount === 0 && !isOnboarding && event.url.pathname !== '/login') {
		throw redirect(302, '/onboarding');
	}
	
	// If users exist and we're on onboarding, redirect to login
	if (userCount > 0 && isOnboarding) {
		throw redirect(302, '/login');
	}
	
	const user = await optionalAuth(event);
	
	// If user is logged in, redirect based on role
	if (user) {
		const pathname = event.url.pathname;
		
		// Admin users should only access admin routes
		if (user.role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/login') {
			throw redirect(302, '/admin');
		}
		
		// Regular users should only access user routes
		if (user.role === 'user' && pathname.startsWith('/admin')) {
			throw redirect(302, '/');
		}
	}
	
	return {
		user: user ? {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			phone: user.phone
		} : null
	};
}; 