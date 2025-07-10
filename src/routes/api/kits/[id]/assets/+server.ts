import type { RequestHandler } from '@sveltejs/kit';
import { KitService } from '$lib/server/kit';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const assets = await KitService.assets(Number(params.id));
  return new Response(JSON.stringify(assets), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json(); // { assetId, quantity }
  const ka = await KitService.addAsset(Number(params.id), body.assetId, body.quantity);
  return new Response(JSON.stringify(ka), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 