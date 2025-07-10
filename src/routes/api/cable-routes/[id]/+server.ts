import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const route = await CableRouteService.get(Number(params.id));
  if (!route) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(route), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const updated = await CableRouteService.update(Number(params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await CableRouteService.delete(Number(params.id));
  return new Response(null, { status: 204 });
}; 