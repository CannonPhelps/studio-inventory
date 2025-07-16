import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const PUT: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const seg = await CableRouteService.updateSegment(Number(event.params.segmentId), body);
  return new Response(JSON.stringify(seg), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  await CableRouteService.deleteSegment(Number(event.params.segmentId));
  return new Response(null, { status: 204 });
}; 