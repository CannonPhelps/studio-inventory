import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const items = await PackListService.items(Number(params.id));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  const body = await event.request.json();
  const created = await PackListService.addItem(Number(params.id), Number(body.assetId), Number(body.quantityRequested), body.notes);
  return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } });
};


