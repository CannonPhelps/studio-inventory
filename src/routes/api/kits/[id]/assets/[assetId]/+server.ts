import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await KitService.removeAsset(Number(params.id), Number(params.assetId));
  return new Response(null, { status: 204 });
}; 