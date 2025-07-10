import type { RequestHandler } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/project';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async () => {
  const projects = await ProjectService.list();
  return new Response(JSON.stringify(projects), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  // locals typing from SvelteKit is any by default; wrap in object expected by requireAdmin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const project = await ProjectService.create(body);
  return new Response(JSON.stringify(project), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 