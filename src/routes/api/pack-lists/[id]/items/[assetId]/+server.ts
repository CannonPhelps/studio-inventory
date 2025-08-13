import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { requireAdmin } from '$lib/server/routeProtection';

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  await PackListService.removeItem(Number(params.id), Number(params.assetId));
  return new Response(null, { status: 204 });
};

export const PATCH: RequestHandler = async (event) => {
  await requireAdmin(event);
  const { params } = event;
  const body = await event.request.json();
  let updated;
  if (body && typeof body === 'object') {
    if (body.quantity !== undefined) {
      // Single quantity updates both requested and packed to keep UI simple
      const qty = Number(body.quantity);
      await PackListService.setItemRequestedQuantity(Number(params.id), Number(params.assetId), qty);
      updated = await PackListService.setItemPackedQuantity(Number(params.id), Number(params.assetId), qty);
    } else if (body.quantityPacked !== undefined) {
      updated = await PackListService.setItemPackedQuantity(Number(params.id), Number(params.assetId), Number(body.quantityPacked));
    }
    if (body.substituteAssetId !== undefined) {
      updated = await PackListService.setItemSubstitute(Number(params.id), Number(params.assetId), body.substituteAssetId === null ? null : Number(body.substituteAssetId));
    }
    if (Array.isArray(body.serialNumbers)) {
      updated = await PackListService.setItemSerialNumbers(Number(params.id), Number(params.assetId), body.serialNumbers.map(String));
    }
  }
  if (!updated) return new Response('No valid fields', { status: 400 });
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};


