import type { RequestHandler } from '@sveltejs/kit';
import { PackListService } from '$lib/server/packList';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async (event) => {
  await requireAdmin(event);
  const ids = await PackListService.activeUsedAssetIds();
  return new Response(JSON.stringify(ids), { headers: { 'Content-Type': 'application/json' } });
};


