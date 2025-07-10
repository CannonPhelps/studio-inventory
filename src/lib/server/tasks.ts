import cron from 'node-cron';
import { prisma } from '$lib/db';

interface ScheduleHandle {
  stop: () => void;
}

export class TaskRunner {
  private static scheduled: Map<number, ScheduleHandle> = new Map();
  private static initialized = false;

  static async init() {
    if (this.initialized) return;
    this.initialized = true;
    await this.loadTasks();
  }

  private static async loadTasks() {
    const tasks = await prisma.automatedTask.findMany({ where: { status: 'active' } });
    tasks.forEach(t => this.scheduleTask(t.id));
  }

  static async scheduleTask(id: number) {
    const task = await prisma.automatedTask.findUnique({ where: { id } });
    if (!task || task.status !== 'active') return;

    // cancel existing
    this.cancelTask(id);

    if (task.type === 'cron' && task.schedule) {
      const job = cron.schedule(task.schedule, () => this.executeTask(id), { timezone: 'UTC' });
      this.scheduled.set(id, { stop: () => job.stop() });
    } else if (task.type === 'interval' && task.schedule) {
      const ms = parseInt(task.schedule);
      if (!isNaN(ms) && ms > 0) {
        const interval = setInterval(() => this.executeTask(id), ms);
        this.scheduled.set(id, { stop: () => clearInterval(interval) });
      }
    }
  }

  static cancelTask(id: number) {
    const handle = this.scheduled.get(id);
    if (handle) {
      handle.stop();
      this.scheduled.delete(id);
    }
  }

  static async executeTask(id: number) {
    const task = await prisma.automatedTask.findUnique({ where: { id } });
    if (!task || task.status !== 'active') return;

    try {
      // Placeholder: you would parse task.payload and perform logic
      // For example, send overdue reminders, backups, etc.
      // For now, just log
      console.log(`Executing task ${task.name} (#${task.id})`);

      await prisma.automatedTask.update({ where: { id }, data: { lastRun: new Date() } });
      await prisma.automatedTaskLog.create({ data: { taskId: id, success: true, message: 'Executed successfully' } });
    } catch (error) {
      console.error('Task execution error', error);
      await prisma.automatedTask.update({ where: { id }, data: { status: 'failed', lastResult: String(error) } });
      await prisma.automatedTaskLog.create({ data: { taskId: id, success: false, message: String(error) } });
    }
  }
}

export class AutomatedTaskService {
  static async create(data: { name: string; type: string; schedule?: string; event?: string; payload?: import('@prisma/client').Prisma.JsonValue | null }) {
    const task = await prisma.automatedTask.create({ data });
    await TaskRunner.scheduleTask(task.id);
    return task;
  }

  static async update(id: number, data: Partial<{ name: string; type: string; schedule?: string; event?: string; payload?: import('@prisma/client').Prisma.JsonValue | null; status?: string }>) {
    const task = await prisma.automatedTask.update({ where: { id }, data });
    await TaskRunner.scheduleTask(id);
    return task;
  }

  static async delete(id: number) {
    await prisma.automatedTask.delete({ where: { id } });
    TaskRunner.cancelTask(id);
  }

  static async list() {
    return await prisma.automatedTask.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async logs(taskId: number, take = 50) {
    return await prisma.automatedTaskLog.findMany({ where: { taskId }, orderBy: { executedAt: 'desc' }, take });
  }
} 