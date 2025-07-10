import type { RequestHandler } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/project';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const project = await ProjectService.get(Number(params.id));
  if (!project) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(project), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const updated = await ProjectService.update(Number(params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await ProjectService.delete(Number(params.id));
  return new Response(null, { status: 204 });
}; 