import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async () => {
  const routes = await CableRouteService.list();
  return new Response(JSON.stringify(routes), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const route = await CableRouteService.create(body);
  return new Response(JSON.stringify(route), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 