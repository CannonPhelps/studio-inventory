import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const kit = await KitService.get(Number(params.id));
  if (!kit) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(kit), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const updated = await KitService.update(Number(event.params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  await KitService.delete(Number(event.params.id));
  return new Response(null, { status: 204 });
}; 