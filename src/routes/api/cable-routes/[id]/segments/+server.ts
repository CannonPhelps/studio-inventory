import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async (event) => {
  await requireAdmin(event);
  const segs = await CableRouteService.listSegments(Number(event.params.id));
  return new Response(JSON.stringify(segs), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const seg = await CableRouteService.addSegment(Number(event.params.id), body);
  return new Response(JSON.stringify(seg), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 