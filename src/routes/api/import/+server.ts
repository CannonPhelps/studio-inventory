import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import { requireAuth } from '$lib/server/routeProtection';

export const POST: RequestHandler = async (event) => {
	try {
		// Require authentication
		await requireAuth(event);
		
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		const importType = formData.get('importType') as string;

		if (!file || !importType) {
			console.error('Missing required fields:', { file: !!file, importType });
			return json({ error: 'File and import type are required' }, { status: 400 });
		}

		console.log('Import request:', { 
			fileName: file.name, 
			fileSize: file.size, 
			importType,
			contentType: file.type 
		});

		const csvText = await file.text();
		
		// Parse CSV properly handling quoted fields and newlines
		function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
			const lines: string[] = [];
			let currentLine = '';
			let inQuotes = false;
			
			// First, properly split by lines while respecting quoted fields
			for (let i = 0; i < csvText.length; i++) {
				const char = csvText[i];
				
				if (char === '"') {
					inQuotes = !inQuotes;
					currentLine += char;
				} else if (char === '\n' && !inQuotes) {
					if (currentLine.trim()) {
						lines.push(currentLine.trim());
					}
					currentLine = '';
				} else {
					currentLine += char;
				}
			}
			
			if (currentLine.trim()) {
				lines.push(currentLine.trim());
			}
			
			if (lines.length < 2) {
				throw new Error('CSV file must have at least a header and one data row');
			}
			
			// Parse each line into fields
			function parseCSVLine(line: string): string[] {
				const result = [];
				let current = '';
				let inQuotes = false;
				
				for (let i = 0; i < line.length; i++) {
					const char = line[i];
					
					if (char === '"') {
						inQuotes = !inQuotes;
					} else if (char === ',' && !inQuotes) {
						result.push(current.trim());
						current = '';
					} else {
						current += char;
					}
				}
				
				result.push(current.trim());
				return result.map(field => field.replace(/^"|"$/g, '').replace(/\n/g, ' '));
			}
			
			const headers = parseCSVLine(lines[0]);
			const rows = lines.slice(1).map(line => parseCSVLine(line));
			
			return { headers, rows };
		}
		
		let headers: string[];
		let dataRows: string[][];
		
		try {
			const parsed = parseCSV(csvText);
			headers = parsed.headers;
			dataRows = parsed.rows;

			// Debug logging
			console.log('Headers:', headers);
			console.log('First few data rows:', dataRows.slice(0, 3));
		} catch (error) {
			return json({ error: `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 400 });
		}

		let results: { imported: number; errors: string[] } = { imported: 0, errors: [] };

		switch (importType) {
			case 'cableTypes':
				results = await importCableTypes(headers, dataRows);
				break;
			case 'bulkCables':
				results = await importBulkCables(headers, dataRows);
				break;
			case 'assets':
				results = await importAssets(headers, dataRows);
				break;
			default:
				return json({ error: 'Invalid import type' }, { status: 400 });
		}

		return json(results);
	} catch (error) {
		console.error('Import error:', error);
		return json({ error: 'Failed to process import' }, { status: 500 });
	}
};

async function importCableTypes(headers: string[], dataRows: string[][]) {
	const results = { imported: 0, errors: [] as string[] };

	for (let i = 0; i < dataRows.length; i++) {
		try {
			const row = dataRows[i];
			const rowData: Record<string, string> = {};
			
			headers.forEach((header, index) => {
				rowData[header] = row[index] || '';
			});

			if (!rowData.name) {
				results.errors.push(`Row ${i + 2}: Name is required`);
				continue;
			}

			await prisma.cableType.create({
				data: {
					name: rowData.name,
					description: rowData.description || null,
					color: rowData.color || null,
					gauge: rowData.gauge || null,
					impedance: rowData.impedance || null,
					maxLength: rowData.maxLength ? parseInt(rowData.maxLength) : null
				}
			});

			results.imported++;
		} catch (error) {
			results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return results;
}

async function importBulkCables(headers: string[], dataRows: string[][]) {
	const results = { imported: 0, errors: [] as string[] };

	for (let i = 0; i < dataRows.length; i++) {
		try {
			const row = dataRows[i];
			const rowData: Record<string, string> = {};
			
			headers.forEach((header, index) => {
				rowData[header] = row[index] || '';
			});

			if (!rowData.cableTypeName || !rowData.totalLength) {
				results.errors.push(`Row ${i + 2}: Cable type name and total length are required`);
				continue;
			}

			// Find or create cable type
			let cableType = await prisma.cableType.findFirst({
				where: { name: rowData.cableTypeName }
			});

			if (!cableType) {
				cableType = await prisma.cableType.create({
					data: { name: rowData.cableTypeName }
				});
			}

			await prisma.bulkCable.create({
				data: {
					cableTypeId: cableType.id,
					totalLength: parseInt(rowData.totalLength),
					remainingLength: rowData.remainingLength ? parseInt(rowData.remainingLength) : parseInt(rowData.totalLength),
					location: rowData.location || null,
					supplier: rowData.supplier || null,
					purchaseDate: rowData.purchaseDate ? new Date(rowData.purchaseDate) : null,
					purchasePrice: rowData.purchasePrice ? parseFloat(rowData.purchasePrice) : null,
					notes: rowData.notes || null
				}
			});

			results.imported++;
		} catch (error) {
			results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return results;
}

async function importAssets(headers: string[], dataRows: string[][]) {
	const results = { imported: 0, errors: [] as string[] };

			for (let i = 0; i < dataRows.length; i++) {
		try {
			const row = dataRows[i];
			const rowData: Record<string, string> = {};
			
			headers.forEach((header, index) => {
				rowData[header] = row[index] || '';
			});

			// Debug logging for first few rows
			if (i < 3) {
				console.log(`Row ${i + 2}:`, rowData);
			}

			// Map CSV fields to expected field names
			const itemName = rowData['Item Name'] || rowData.itemName || '';
			const quantity = rowData.Quanty || rowData.quantity || '1';
			const categoryName = rowData.Category || rowData.category || '';
			const modelBrand = rowData['Model/Brand'] || rowData.modelBrand || '';
			const serialNumber = rowData['Serial Number'] || rowData.serialNumber || '';
			const location = rowData.Location || rowData.location || '';
			const status = rowData.Status || rowData.status || 'Available';
			const purchaseDate = rowData['Purchase Date'] || rowData.purchaseDate || '';
			const purchasePrice = rowData['Purchase Price'] || rowData.purchasePrice || '';
			const lastMaintenance = rowData['Last Maintenance'] || rowData.lastMaintenance || '';
			const warrantyExpiration = rowData['Warranty Expiration'] || rowData.warrantyExpiration || '';
			const notes = rowData.Notes || rowData.notes || '';
			const assigned = rowData.Assigned || rowData.assigned || '';
			const assetNumber = rowData['Asset Number'] || rowData.assetNumber || '';
			const supplier = rowData.Supplier || rowData.supplier || '';

			if (!itemName || !categoryName) {
				results.errors.push(`Row ${i + 2}: Item name and category are required. Found: itemName="${itemName}", category="${categoryName}"`);
				continue;
			}

			// Find or create category
			let category = await prisma.category.findFirst({
				where: { name: categoryName }
			});

			if (!category) {
				category = await prisma.category.create({
					data: { name: categoryName }
				});
			}

			// Check if this is a cable
			const isCable = itemName.toLowerCase().includes('cable') || 
						   (categoryName.toLowerCase() === 'video' && itemName.toLowerCase().includes('sdi'));

			// Find cable type if it's a cable
			let cableTypeId = null;
			if (isCable) {
				const cableType = await prisma.cableType.findFirst({
					where: { name: 'SDI' } // Default to SDI for now
				});
				if (cableType) {
					cableTypeId = cableType.id;
				}
			}

			// Extract length from item name for cables
			let cableLength = null;
			if (isCable) {
				const lengthMatch = itemName.match(/(\d+)['"]/);
				if (lengthMatch) {
					cableLength = parseInt(lengthMatch[1]);
				}
			}

			await prisma.asset.create({
				data: {
					itemName: itemName,
					quantity: quantity ? parseInt(quantity) : 1,
					categoryId: category.id,
					modelBrand: modelBrand || null,
					serialNumber: serialNumber || null,
					location: location || null,
					status: status || 'Available',
					purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
					purchasePrice: purchasePrice ? parseFloat(purchasePrice.replace(/[$,]/g, '')) : null,
					lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
					warrantyExpiration: warrantyExpiration ? new Date(warrantyExpiration) : null,
					notes: notes || null,
					assigned: assigned || null,
					assetNumber: assetNumber || null,
					supplier: supplier || null,
					isCable: isCable,
					cableTypeId: cableTypeId,
					cableLength: cableLength
				}
			});

			results.imported++;
		} catch (error) {
			results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return results;
} 