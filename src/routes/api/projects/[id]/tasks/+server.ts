import type { RequestHandler } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/project';
import { requireAdmin } from '$lib/server/routeProtection';

export const GET: RequestHandler = async ({ params }) => {
  const tasks = await ProjectService.tasksByProject(Number(params.id));
  return new Response(JSON.stringify(tasks), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const task = await ProjectService.addTask(Number(params.id), body);
  return new Response(JSON.stringify(task), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 