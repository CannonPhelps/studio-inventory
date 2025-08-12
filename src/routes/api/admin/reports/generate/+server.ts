import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		// Check if user is authenticated and is admin
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = url.searchParams;
		const reportType = searchParams.get('type') || 'summary';
		const category = searchParams.get('category') || 'all';
		const cableType = searchParams.get('cableType') || 'all';
		const dateRange = searchParams.get('dateRange') || 'all';
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const groupBy = searchParams.get('groupBy') || 'none';

		// Build where clause for filtering
		const whereClause: any = {};
		
		if (category !== 'all') {
			if (category.includes(',')) {
				const ids = category.split(',').map((c) => parseInt(c.trim())).filter((n) => !Number.isNaN(n));
				if (ids.length > 0) whereClause.categoryId = { in: ids };
			} else {
				whereClause.categoryId = parseInt(category);
			}
		}
		
		if (cableType !== 'all') {
			whereClause.cableTypeId = parseInt(cableType);
		}

		// If cables report, enforce cable-only assets
		if (reportType === 'cables') {
			whereClause.isCable = true;
		}

		// Add date filtering
		if (dateRange !== 'all') {
			const now = new Date();
			let start: Date | undefined;
			let end: Date | undefined;

			switch (dateRange) {
				case 'thisMonth': {
					start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
					end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
					break;
				}
				case 'thisYear': {
					start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
					end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
					break;
				}
				case 'custom': {
					if (startDate) start = new Date(startDate);
					if (endDate) end = new Date(endDate);
					if (end) end.setHours(23, 59, 59, 999);
					break;
				}
			}

			if (start || end) {
				whereClause.purchaseDate = {} as any;
				if (start) (whereClause.purchaseDate as any).gte = start;
				if (end) (whereClause.purchaseDate as any).lte = end;
			}
		}

		// Fetch assets based on filters
		const assets = await prisma.asset.findMany({
			where: whereClause,
			select: {
				id: true,
				itemName: true,
				quantity: true,
				categoryId: true,
				modelBrand: true,
				location: true,
				roomId: true,
				status: true,
				purchaseDate: true,
				purchasePrice: true,
				lastMaintenance: true,
				warrantyExpiration: true,
				notes: true,
				assigned: true,
				assetNumber: true,
				supplier: true,
				cableLength: true,
				cableTypeId: true,
				isCable: true,
				category: { select: { id: true, name: true } },
				cableType: { select: { id: true, name: true } },
				room: { select: { id: true, name: true } },
				serialNumbers: { select: { serialNumber: true } },
				maintenanceRecords: {
					select: {
						id: true,
						performedAt: true,
						notes: true,
						performedBy: true,
						cost: true,
						status: true,
						maintenanceType: true,
						scheduledDate: true,
						completedDate: true,
						priority: true
					}
				},
				financialRecords: {
					select: {
						id: true,
						type: true,
						category: true,
						amount: true,
						date: true,
						description: true
					}
				}
			},
			orderBy: [
				{ category: { name: 'asc' } },
				{ itemName: 'asc' }
			]
		});

		// Generate report data based on type
		let reportData: any = {
			totalAssets: assets.length,
			categoryCount: new Set(assets.map(a => a.categoryId)).size,
			generatedAt: new Date().toISOString()
		};

		// Common detailed asset mapping used by multiple report types
		const mapAsset = (asset: any) => ({
			id: asset.id,
			name: asset.itemName,
			category: asset.category?.name || 'N/A',
			quantity: asset.quantity,
			status: asset.status,
			location: asset.location || 'N/A',
			room: asset.room?.name || 'N/A',
			modelBrand: asset.modelBrand || 'N/A',
			supplier: asset.supplier || 'N/A',
			assetNumber: asset.assetNumber || 'N/A',
			isCable: asset.isCable || false,
			cableType: asset.cableType?.name || 'N/A',
			cableLength: asset.cableLength ?? null,
			purchaseDate: asset.purchaseDate,
			purchasePrice: asset.purchasePrice,
			serialNumbers: (asset.serialNumbers || []).map((sn: any) => sn.serialNumber ?? sn)
		});

		switch (reportType) {
			case 'summary':
				reportData.summary = generateSummaryReport(assets);
				break;
			case 'detailed':
				reportData.assets = assets.map(mapAsset);
				break;
			case 'financial':
				reportData.financial = generateFinancialReport(assets);
				break;
			case 'maintenance':
				reportData.maintenance = generateMaintenanceReport(assets);
				break;
			case 'location':
				reportData.location = generateLocationReport(assets);
				break;
			case 'cables': {
				const cableReport = await generateCableReport(assets);
				reportData.cables = cableReport;
				break;
			}
		}

		// Always include a comprehensive assets list for richer client-side tables
		if (!reportData.assets) {
			reportData.assets = assets.map(mapAsset);
		}

		// Groupings
		if (groupBy === 'category') {
			reportData.categoryGroups = generateCategoryGroups(assets);
		}

		return json({
			success: true,
			report: reportData
		});

	} catch (error) {
		console.error('Error generating report:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};

function generateSummaryReport(assets: any[]) {
	const summary: any = {};
	
	// Count by category
	const categoryCounts: { [key: string]: number } = {};
	assets.forEach(asset => {
		const categoryName = asset.category.name;
		categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + asset.quantity;
	});
	
	summary.categoryBreakdown = categoryCounts;
	summary.totalValue = assets.reduce((sum, asset) => {
		return sum + (asset.purchasePrice ? parseFloat(asset.purchasePrice.toString()) : 0);
	}, 0);
	
	// Count by status
	const statusCounts: { [key: string]: number } = {};
	assets.forEach(asset => {
		statusCounts[asset.status] = (statusCounts[asset.status] || 0) + asset.quantity;
	});
	summary.statusBreakdown = statusCounts;
	
	return summary;
}

function generateFinancialReport(assets: any[]) {
	const financial: any = {};
	
	financial.totalPurchaseValue = assets.reduce((sum, asset) => {
		return sum + (asset.purchasePrice ? parseFloat(asset.purchasePrice.toString()) : 0);
	}, 0);
	
	financial.averageAssetValue = assets.length > 0 ? financial.totalPurchaseValue / assets.length : 0;
	
	// Group by category for financial analysis
	const categoryValues: { [key: string]: number } = {};
	assets.forEach(asset => {
		const categoryName = asset.category.name;
		const value = asset.purchasePrice ? parseFloat(asset.purchasePrice.toString()) : 0;
		categoryValues[categoryName] = (categoryValues[categoryName] || 0) + value;
	});
	
	financial.categoryValues = categoryValues;
	
	return financial;
}

function generateMaintenanceReport(assets: any[]) {
	const maintenance: any = {};
	
	maintenance.totalMaintenanceRecords = assets.reduce((sum, asset) => {
		return sum + asset.maintenanceRecords.length;
	}, 0);
	
	// Count by maintenance type
	const maintenanceTypeCounts: { [key: string]: number } = {};
	assets.forEach(asset => {
		asset.maintenanceRecords.forEach((record: any) => {
			const type = record.maintenanceType || 'Unknown';
			maintenanceTypeCounts[type] = (maintenanceTypeCounts[type] || 0) + 1;
		});
	});
	
	maintenance.maintenanceTypeBreakdown = maintenanceTypeCounts;
	
	// Assets needing maintenance
	maintenance.assetsNeedingMaintenance = assets.filter(asset => 
		asset.maintenanceRecords.some((record: any) => 
			record.status === 'SCHEDULED' || record.status === 'IN_PROGRESS'
		)
	).length;
	
	return maintenance;
}

function generateLocationReport(assets: any[]) {
	const location: any = {};
	
	// Count by location
	const locationCounts: { [key: string]: number } = {};
	assets.forEach(asset => {
		const loc = asset.location || 'Unassigned';
		locationCounts[loc] = (locationCounts[loc] || 0) + asset.quantity;
	});
	
	location.locationBreakdown = locationCounts;
	
	// Count by room
	const roomCounts: { [key: string]: number } = {};
	assets.forEach(asset => {
		const room = asset.room?.name || 'No Room Assigned';
		roomCounts[room] = (roomCounts[room] || 0) + asset.quantity;
	});
	
	location.roomBreakdown = roomCounts;
	
	return location;
}

async function generateCableReport(assets: any[]) {
	// Only consider cable assets
	const cableAssets = assets.filter(a => a.isCable);
	const byType: Record<string, any> = {};
	const typeIdToName: Record<number, string> = {};
	const typeIds: number[] = [];

	for (const asset of cableAssets) {
		const typeName = asset.cableType?.name || 'Unknown';
		const typeId = asset.cableTypeId ?? -1;
		if (!(typeName in byType)) {
			byType[typeName] = {
				totalCables: 0,
				totalLength: 0,
				minLength: Number.POSITIVE_INFINITY,
				maxLength: Number.NEGATIVE_INFINITY,
				avgLength: 0,
				bulkRemainingLength: 0
			};
		}
		if (typeId > 0) {
			typeIdToName[typeId] = typeName;
			if (!typeIds.includes(typeId)) typeIds.push(typeId);
		}
		const qty = asset.quantity ?? 1;
		const len = asset.cableLength ?? 0;
		byType[typeName].totalCables += qty;
		byType[typeName].totalLength += len * qty;
		if (len > 0) {
			byType[typeName].minLength = Math.min(byType[typeName].minLength, len);
			byType[typeName].maxLength = Math.max(byType[typeName].maxLength, len);
		}
	}

	// Replace infinities if no lengths
	Object.values(byType).forEach((t: any) => {
		if (t.minLength === Number.POSITIVE_INFINITY) t.minLength = 0;
		if (t.maxLength === Number.NEGATIVE_INFINITY) t.maxLength = 0;
		if (t.totalCables > 0) t.avgLength = t.totalLength / t.totalCables;
	});

	// Include bulk cable remaining lengths per type
	if (typeIds.length > 0) {
		const bulk = await prisma.bulkCable.findMany({
			where: { cableTypeId: { in: typeIds } },
			select: { cableTypeId: true, remainingLength: true }
		});
		const bulkByTypeId: Record<number, number> = {};
		for (const b of bulk) {
			bulkByTypeId[b.cableTypeId] = (bulkByTypeId[b.cableTypeId] || 0) + (b.remainingLength ?? 0);
		}
		for (const [typeIdStr, total] of Object.entries(bulkByTypeId)) {
			const typeIdNum = Number(typeIdStr);
			const name = typeIdToName[typeIdNum] || 'Unknown';
			if (!byType[name]) byType[name] = { totalCables: 0, totalLength: 0, minLength: 0, maxLength: 0, avgLength: 0, bulkRemainingLength: 0 };
			byType[name].bulkRemainingLength = total;
		}
	}

	const typesCount = Object.keys(byType).length;
	const totalCableAssets = cableAssets.reduce((s, a) => s + (a.quantity ?? 1), 0);
	const totalCableLength = cableAssets.reduce((s, a) => s + ((a.cableLength ?? 0) * (a.quantity ?? 1)), 0);

	return { typesCount, totalCableAssets, totalCableLength, byType };
}

function generateCategoryGroups(assets: any[]) {
	const groups: Record<string, { totalAssets: number; totalQuantity: number; totalValue: number; assets: any[] }> = {};
	for (const a of assets) {
		const cat = a.category?.name || 'Uncategorized';
		if (!groups[cat]) {
			groups[cat] = { totalAssets: 0, totalQuantity: 0, totalValue: 0, assets: [] };
		}
		groups[cat].totalAssets += 1;
		groups[cat].totalQuantity += a.quantity ?? 1;
		groups[cat].totalValue += a.purchasePrice ? parseFloat(a.purchasePrice.toString()) : 0;
	}
	return groups;
}


