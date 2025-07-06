import { requireAuth } from '$lib/server/routeProtection';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = await requireAuth(event);
	
	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			phone: user.phone
		}
	};
}; 