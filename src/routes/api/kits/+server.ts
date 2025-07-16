import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async () => {
  const kits = await KitService.list();
  return new Response(JSON.stringify(kits), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const kit = await KitService.create(body);
  return new Response(JSON.stringify(kit), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 