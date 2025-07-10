import { redirect } from '@sveltejs/kit';
import { optionalAuth } from '$lib/server/routeProtection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = await optionalAuth(event);
	
	// If user is already logged in, redirect based on role
	if (user) {
		if (user.role === 'admin') {
			throw redirect(302, '/admin');
		} else {
			throw redirect(302, '/');
		}
	}
	
	return {};
}; 