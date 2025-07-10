import type { RequestHandler } from '@sveltejs/kit';
import { CableRouteService } from '$lib/server/cableRoute';
import { requireAdmin } from '$lib/server/routeProtection';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const seg = await CableRouteService.updateSegment(Number(params.segmentId), body);
  return new Response(JSON.stringify(seg), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await CableRouteService.deleteSegment(Number(params.segmentId));
  return new Response(null, { status: 204 });
}; 