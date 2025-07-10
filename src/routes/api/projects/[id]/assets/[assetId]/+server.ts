import type { RequestHandler } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/project';
import { requireAdmin } from '$lib/server/routeProtection';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await ProjectService.removeAsset(Number(params.id), Number(params.assetId));
  return new Response(null, { status: 204 });
}; 