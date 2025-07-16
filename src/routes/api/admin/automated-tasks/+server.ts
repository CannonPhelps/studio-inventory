import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    // Get the session from cookies
    const sessionId = cookies.get('auth_session');
    if (!sessionId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Find the session and user
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return json({ error: 'Session expired' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return json({ error: 'Admin access required' }, { status: 403 });
    }

    // Return empty array for now - can be replaced with real DB query later
    return json([]);
  } catch (error) {
    console.error('Error loading automated tasks:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const taskData = await request.json();

    // Get the session from cookies
    const sessionId = cookies.get('auth_session');
    if (!sessionId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Find the session and user
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return json({ error: 'Session expired' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return json({ error: 'Admin access required' }, { status: 403 });
    }

    // TODO: Implement actual task creation logic
    // For now, return a mock response
    const newTask = {
      id: Date.now().toString(),
      name: taskData.name,
      description: taskData.description,
      schedule: taskData.schedule,
      action: taskData.action,
      enabled: taskData.enabled,
      createdAt: new Date().toISOString(),
      lastRun: null
    };

    return json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error('Error creating automated task:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 