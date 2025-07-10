import type { RequestHandler } from '@sveltejs/kit';
import { ProjectService } from '$lib/server/project';
import { requireAdmin } from '$lib/server/routeProtection';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  const body = await request.json();
  const task = await ProjectService.updateTask(Number(params.taskId), body);
  return new Response(JSON.stringify(task), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await requireAdmin({ locals } as any);
  await ProjectService.deleteTask(Number(params.taskId));
  return new Response(null, { status: 204 });
}; 