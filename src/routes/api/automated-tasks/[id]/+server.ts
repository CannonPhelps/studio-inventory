import type { RequestHandler } from '@sveltejs/kit';
import { AutomatedTaskService } from '$lib/server/tasks';

export const GET: RequestHandler = async ({ params }) => {
  const task = await AutomatedTaskService.list().then(list => list.find(t => t.id === Number(params.id)));
  if (!task) return new Response('Not Found', { status: 404 });
  return new Response(JSON.stringify(task), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const updated = await AutomatedTaskService.update(Number(params.id), body);
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params }) => {
  await AutomatedTaskService.delete(Number(params.id));
  return new Response(null, { status: 204 });
}; 