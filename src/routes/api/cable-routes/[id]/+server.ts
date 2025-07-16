import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async (event) => {
  await requireAdmin(event);
  const route = await CableRouteService.get(Number(event.params.id));
  if (!route) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(route), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const updated = await CableRouteService.update(Number(event.params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  await CableRouteService.delete(Number(event.params.id));
  return new Response(null, { status: 204 });
}; 