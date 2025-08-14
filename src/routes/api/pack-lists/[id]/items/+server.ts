import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { prisma } from '$lib/db';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const items = await PackListService.items(Number(params.id));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  const body = await event.request.json();
  // Prevent adding an asset that is already in another active PNL
  const assetId = Number(body.assetId);
  const packListId = Number(params.id);
  const existing = await prisma.packListItem.findFirst({
    where: {
      assetId,
      packListId: { not: packListId },
      packList: { status: { in: ['draft', 'picking', 'packed', 'checked_out'] } }
    }
  });
  if (existing) {
    return new Response(JSON.stringify({ error: 'Asset is already included in another active PNL' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
  }

  const created = await PackListService.addItem(packListId, assetId, Number(body.quantityRequested), body.notes);
  return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } });
};


