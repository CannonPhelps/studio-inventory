import { prisma } from '$lib/db';

export interface ProjectInput {
  name: string;
  description?: string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budget?: number;
}

export class ProjectService {
  static async create(data: ProjectInput) {
    return await prisma.project.create({ data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined } });
  }

  static async update(id: number, data: Partial<ProjectInput>) {
    return await prisma.project.update({ where: { id }, data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined } });
  }

  static async delete(id: number) {
    await prisma.project.delete({ where: { id } });
    return true;
  }

  static async list() {
    return await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include: { assets: { include: { asset: { select: { itemName: true } } } }, tasks: true } });
  }

  static async get(id: number) {
    return await prisma.project.findUnique({ where: { id }, include: { assets: { include: { asset: true } }, tasks: true } });
  }

  static async addAsset(projectId: number, assetId: number) {
    return await prisma.projectAsset.create({ data: { projectId, assetId } });
  }

  static async removeAsset(projectId: number, assetId: number) {
    await prisma.projectAsset.delete({ where: { projectId_assetId: { projectId, assetId } } });
  }

  static async addTask(projectId: number, data: { name: string; description?: string; assignedTo?: string; dueDate?: Date | string }) {
    return await prisma.projectTask.create({ data: { projectId, ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined } });
  }

  static async updateTask(id: number, data: Partial<{ name: string; description?: string; assignedTo?: string; status?: string; dueDate?: Date | string; completedAt?: Date | string }>) {
    return await prisma.projectTask.update({ where: { id }, data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : undefined, completedAt: data.completedAt ? new Date(data.completedAt) : undefined } });
  }

  static async deleteTask(id: number) {
    await prisma.projectTask.delete({ where: { id } });
  }

  static async assets(projectId: number) {
    return await prisma.projectAsset.findMany({ where: { projectId }, include: { asset: true } });
  }

  static async tasksByProject(projectId: number) {
    return await prisma.projectTask.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } });
  }
} 