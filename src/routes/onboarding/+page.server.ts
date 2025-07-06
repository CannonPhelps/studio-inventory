import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/db';

export const load = async () => {
	// Check if any users exist
	const userCount = await prisma.user.count();

	// If users already exist, redirect to login
	if (userCount > 0) {
		throw redirect(302, '/login');
	}

	return {
		// Page is accessible for onboarding
	};
}; 