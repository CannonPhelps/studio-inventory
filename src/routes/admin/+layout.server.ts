import { requireAdmin } from '$lib/server/routeProtection';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = await requireAdmin(event);
	
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