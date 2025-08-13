import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  // Deep link to finances for now; could route to a future detail tab
  throw redirect(307, '/admin/finances');
};


