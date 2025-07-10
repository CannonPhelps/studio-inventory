import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const kit = await KitService.get(Number(params.id));
  if (!kit) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(kit), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const updated = await KitService.update(Number(params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await KitService.delete(Number(params.id));
  return new Response(null, { status: 204 });
}; 