import type { RequestHandler } from '@sveltejs/kit';
import { AutomatedTaskService } from '$lib/server/tasks';

export const GET: RequestHandler = async () => {
  const tasks = await AutomatedTaskService.list();
  return new Response(JSON.stringify(tasks), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
  const body = await request.json();
  const task = await AutomatedTaskService.create(body);
  return new Response(JSON.stringify(task), { status: 201, headers: { 'Content-Type': 'application/json' } });
}; 