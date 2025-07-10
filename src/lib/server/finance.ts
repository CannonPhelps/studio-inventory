import { prisma } from '$lib/db';

export interface FinancialRecordInput {
  assetId?: number;
  type: string;
  category?: string;
  amount: number;
  date?: Date | string;
  description?: string;
}

export class FinanceService {
  static async addRecord(data: FinancialRecordInput) {
    return await prisma.financialRecord.create({
      data: {
        assetId: data.assetId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description
      }
    });
  }

  static async updateRecord(id: number, data: Partial<FinancialRecordInput>) {
    return await prisma.financialRecord.update({
      where: { id },
      data: {
        assetId: data.assetId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description
      }
    });
  }

  static async deleteRecord(id: number) {
    await prisma.financialRecord.delete({ where: { id } });
    return true;
  }

  static async listRecords(params: {
    type?: string;
    category?: string;
    assetId?: number;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  } = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (params.type) where.type = params.type;
    if (params.category) where.category = params.category;
    if (params.assetId) where.assetId = params.assetId;
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    const [records, total, sum] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: params.skip,
        take: params.take,
        include: { asset: { select: { itemName: true } } }
      }),
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.aggregate({ _sum: { amount: true }, where })
    ]);

    return {
      records,
      total,
      totalAmount: sum._sum.amount ? Number(sum._sum.amount) : 0
    };
  }

  static async getSummary() {
    const [totalSpend, totalMaintenance] = await Promise.all([
      prisma.financialRecord.aggregate({ _sum: { amount: true } }),
      prisma.financialRecord.aggregate({ _sum: { amount: true }, where: { type: 'maintenance' } })
    ]);

    return {
      totalSpend: totalSpend._sum.amount ? Number(totalSpend._sum.amount) : 0,
      totalMaintenance: totalMaintenance._sum.amount ? Number(totalMaintenance._sum.amount) : 0
    };
  }
} 