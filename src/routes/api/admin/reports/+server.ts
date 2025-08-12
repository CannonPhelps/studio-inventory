import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  type: z.enum(['summary','detailed','financial','maintenance','location','cables']),
  categories: z.array(z.number().int().positive()).default([]),
  cableTypeId: z.number().int().positive().optional(),
  dateRange: z.enum(['all','thisMonth','thisYear','custom']).default('all'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['none','category']).default('none')
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, categories, cableTypeId, dateRange, startDate, endDate, groupBy } = parsed.data;

  const where: any = {};
  if (categories.length) where.categoryId = { in: categories };
  if (cableTypeId) where.cableTypeId = cableTypeId;
  if (type === 'cables') where.isCable = true;

  if (dateRange !== 'all') {
    const now = new Date();
    let gte: Date | undefined;
    let lte: Date | undefined;

    if (dateRange === 'thisMonth') {
      gte = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
      lte = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    } else if (dateRange === 'thisYear') {
      gte = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
      lte = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
    } else if (dateRange === 'custom') {
      if (startDate) gte = new Date(startDate);
      if (endDate) { lte = new Date(endDate); lte.setUTCHours(23, 59, 59, 999); }
    }
    if (gte || lte) where.purchaseDate = { ...(gte && { gte }), ...(lte && { lte }) };
  }

  const baseSelect = {
    id: true, itemName: true, quantity: true, categoryId: true,
    modelBrand: true, location: true, roomId: true, status: true,
    purchaseDate: true, purchasePrice: true, assetNumber: true,
    supplier: true, cableLength: true, cableTypeId: true, isCable: true,
    category: { select: { id: true, name: true } },
    cableType: { select: { id: true, name: true } },
    room: { select: { id: true, name: true } }
  } as const;

  const selectByType = {
    summary: baseSelect,
    detailed: { ...baseSelect, serialNumbers: { select: { serialNumber: true } } },
    financial: { ...baseSelect, financialRecords: { select: { id: true, type: true, category: true, amount: true, date: true } } },
    maintenance: { ...baseSelect, maintenanceRecords: { select: { id: true, status: true, maintenanceType: true, cost: true, performedAt: true, scheduledDate: true, completedDate: true, priority: true } } },
    location: baseSelect,
    cables: baseSelect
  } as const;

  const assets = await prisma.asset.findMany({
    where,
    select: selectByType[type],
    orderBy: [{ category: { name: 'asc' } }, { itemName: 'asc' }]
  });

  const mapAsset = (a: any) => ({
    id: a.id,
    name: a.itemName,
    category: a.category?.name ?? 'N/A',
    quantity: a.quantity ?? 0,
    status: a.status,
    location: a.location ?? 'N/A',
    room: a.room?.name ?? 'N/A',
    modelBrand: a.modelBrand ?? 'N/A',
    supplier: a.supplier ?? 'N/A',
    assetNumber: a.assetNumber ?? 'N/A',
    isCable: a.isCable ?? false,
    cableType: a.cableType?.name ?? 'N/A',
    cableLength: a.cableLength ?? null,
    purchaseDate: a.purchaseDate,
    purchasePrice: a.purchasePrice ? Number(a.purchasePrice) : 0,
    serialNumbers: a.serialNumbers ? a.serialNumbers.map((s: any) => s.serialNumber) : []
  });

  const report: any = {
    totalAssets: assets.length,
    categoryCount: new Set(assets.map((a: any) => a.categoryId)).size,
    generatedAt: new Date().toISOString()
  };

  if (type === 'summary') report.summary = generateSummary(assets);
  if (type === 'detailed') report.assets = assets.map(mapAsset);
  if (type === 'financial') report.financial = generateFinancial(assets);
  if (type === 'maintenance') report.maintenance = generateMaintenance(assets);
  if (type === 'location') report.location = generateLocation(assets);
  if (type === 'cables') report.cables = await generateCables(assets);

  if (groupBy === 'category') report.categoryGroups = groupByCategory(assets);

  return json({ success: true, report });
};

function generateSummary(assets: any[]) {
  const summary: any = {};
  const cat: Record<string, number> = {};
  const status: Record<string, number> = {};

  for (const a of assets) {
    const c = a.category?.name ?? 'Uncategorized';
    cat[c] = (cat[c] ?? 0) + (a.quantity ?? 0);
    status[a.status] = (status[a.status] ?? 0) + (a.quantity ?? 0);
  }

  summary.categoryBreakdown = cat;
  summary.statusBreakdown = status;
  return summary;
}

function generateFinancial(assets: any[]) {
  const totalPurchaseValue = assets.reduce((s, a) => s + (a.purchasePrice ? Number(a.purchasePrice) : 0), 0);
  const categoryValues: Record<string, number> = {};
  for (const a of assets) {
    const c = a.category?.name ?? 'Uncategorized';
    categoryValues[c] = (categoryValues[c] ?? 0) + (a.purchasePrice ? Number(a.purchasePrice) : 0);
  }
  return { totalPurchaseValue, averageAssetValue: assets.length ? totalPurchaseValue / assets.length : 0, categoryValues };
}

function generateMaintenance(assets: any[]) {
  const totalMaintenanceRecords = assets.reduce((s, a) => s + (a.maintenanceRecords?.length ?? 0), 0);
  const maintenanceTypeBreakdown: Record<string, number> = {};
  for (const a of assets) for (const r of a.maintenanceRecords ?? []) maintenanceTypeBreakdown[r.maintenanceType ?? 'Unknown'] = (maintenanceTypeBreakdown[r.maintenanceType ?? 'Unknown'] ?? 0) + 1;
  const assetsNeedingMaintenance = assets.filter(a => (a.maintenanceRecords ?? []).some((r: any) => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS')).length;
  return { totalMaintenanceRecords, maintenanceTypeBreakdown, assetsNeedingMaintenance };
}

function generateLocation(assets: any[]) {
  const locationBreakdown: Record<string, number> = {};
  const roomBreakdown: Record<string, number> = {};
  for (const a of assets) {
    locationBreakdown[a.location ?? 'Unassigned'] = (locationBreakdown[a.location ?? 'Unassigned'] ?? 0) + (a.quantity ?? 0);
    roomBreakdown[a.room?.name ?? 'No Room Assigned'] = (roomBreakdown[a.room?.name ?? 'No Room Assigned'] ?? 0) + (a.quantity ?? 0);
  }
  return { locationBreakdown, roomBreakdown };
}

async function generateCables(assets: any[]) {
  const cables = assets.filter(a => a.isCable);

  const inferType = (name?: string, fallback?: string) => {
    const n = (name || '').toUpperCase();
    const candidates = ['SDI','HDMI','XLR','TRS','BNC','ETHERNET','CAT8','CAT7','CAT6','CAT5','USB-C','USB C','USB-A','USB A','USB','THUNDERBOLT','FIBER','OPTICAL','RCA','TS','MINIJACK','3.5','1/4','POWER'];
    for (const c of candidates) if (n.includes(c)) return c.replace(' ', ' ');
    return fallback || 'Unknown';
  };

  const parseLengthFeet = (name?: string, cableLength?: number | null) => {
    if (cableLength && cableLength > 0) return Number(cableLength);
    const s = name || '';
    let feet = 0;
    // feet markers: ' or ’
    const feetMatch = s.match(/(\d+)\s*[’']/);
    if (feetMatch) feet += parseFloat(feetMatch[1]);
    // inches markers: " or ”
    const inchMatch = s.match(/(\d+)\s*[”"]/);
    if (inchMatch) feet += parseFloat(inchMatch[1]) / 12;
    // words fallback
    const ftWord = s.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet)/i);
    if (ftWord) feet = parseFloat(ftWord[1]);
    const inWord = s.match(/(\d+(?:\.\d+)?)\s*(?:in|inch|inches)/i);
    if (inWord) feet = parseFloat(inWord[1]) / 12;
    return isFinite(feet) && feet > 0 ? feet : 0;
  };

  const byType: Record<string, any> = {};
  const detailByType: Record<string, { name: string; length: number; cost: number; qty: number }[]> = {};

  for (const a of cables) {
    const type = inferType(a.itemName, a.cableType?.name);
    const len = parseLengthFeet(a.itemName, a.cableLength);
    const qty = a.quantity ?? 1;
    const cost = a.purchasePrice ? Number(a.purchasePrice) : 0;

    if (!byType[type]) {
      byType[type] = { totalCables: 0, totalLength: 0, minLength: Infinity, maxLength: -Infinity };
      detailByType[type] = [];
    }
    byType[type].totalCables += qty;
    byType[type].totalLength += len * qty;
    if (len > 0) {
      byType[type].minLength = Math.min(byType[type].minLength, len);
      byType[type].maxLength = Math.max(byType[type].maxLength, len);
    }

    detailByType[type].push({ name: a.itemName, length: len, cost, qty });
  }

  Object.values(byType).forEach((t: any) => {
    if (t.minLength === Infinity) t.minLength = 0;
    if (t.maxLength === -Infinity) t.maxLength = 0;
    t.avgLength = t.totalCables > 0 ? t.totalLength / t.totalCables : 0;
  });

  const typesCount = Object.keys(byType).length;
  const totalCableAssets = cables.reduce((s, a) => s + (a.quantity ?? 1), 0);
  const totalCableLength = Object.values(byType).reduce((s: number, t: any) => s + (t.totalLength ?? 0), 0);

  return { typesCount, totalCableAssets, totalCableLength, byType, detailByType };
}

function groupByCategory(assets: any[]) {
  const groups: Record<string, { totalAssets: number; totalQuantity: number; totalValue: number }> = {};
  for (const a of assets) {
    const name = a.category?.name ?? 'Uncategorized';
    if (!groups[name]) groups[name] = { totalAssets: 0, totalQuantity: 0, totalValue: 0 };
    groups[name].totalAssets += 1;
    groups[name].totalQuantity += a.quantity ?? 0;
    groups[name].totalValue += a.purchasePrice ? Number(a.purchasePrice) : 0;
  }
  return groups;
}
