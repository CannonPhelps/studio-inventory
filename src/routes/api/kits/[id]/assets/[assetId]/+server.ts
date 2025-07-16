import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const DELETE: RequestHandler = async (event) => {
  await requireAdmin(event);
  await KitService.removeAsset(Number(event.params.id), Number(event.params.assetId));
  return new Response(null, { status: 204 });
}; 