import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const packList = await PackListService.get(Number(params.id));
  if (!packList) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(packList), { headers: { 'Content-Type': 'application/json' } });
};

export const PATCH: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  const body = await event.request.json();
  const updated = await PackListService.update(Number(params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  await PackListService.delete(Number(params.id));
  return new Response(null, { status: 204 });
};


