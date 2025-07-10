import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const segs = await CableRouteService.listSegments(Number(params.id));
  return new Response(JSON.stringify(segs), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const seg = await CableRouteService.addSegment(Number(params.id), body);
  return new Response(JSON.stringify(seg), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 