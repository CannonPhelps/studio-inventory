import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async () => {
  const packLists = await PackListService.list();
  return new Response(JSON.stringify(packLists), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);
  const body = await event.request.json();
  const packList = await PackListService.create(body);
  return new Response(JSON.stringify(packList), { status: 201, headers: { 'Content-Type': 'application/json' } });
};


