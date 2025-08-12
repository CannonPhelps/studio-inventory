<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';

	let categories: any[] = [];
	let cableTypes: any[] = [];
	let selectedCategory: string = 'all';
	let selectedCategories: string[] = [];
	let selectedCableType: string = 'all';
	let selectedReportType: string = 'summary';
	let dateRange: string = 'all';
	let groupBy: string = 'none';
	let customStartDate: string = '';
	let customEndDate: string = '';
	let isLoading = false;
	let reportData: any = null;

	onMount(async () => {
		await loadCategories();
		await loadCableTypes();
	});

	async function loadCategories() {
		try {
			const response = await fetch('/api/categories');
			const data = await response.json();
			categories = Array.isArray(data) ? data : (data.categories || []);
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	}

	async function loadCableTypes() {
		try {
			const response = await fetch('/api/cable-types');
			const data = await response.json();
			cableTypes = Array.isArray(data) ? data : (data.cableTypes || []);
		} catch (error) {
			console.error('Error loading cable types:', error);
		}
	}

	async function generateReport() {
		isLoading = true;
		try {
			const payload: any = {
				type: selectedReportType,
				categories: (selectedCategories || []).map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
				cableTypeId: selectedCableType !== 'all' ? Number(selectedCableType) : undefined,
				dateRange,
				startDate: dateRange === 'custom' && customStartDate ? new Date(customStartDate).toISOString() : undefined,
				endDate: dateRange === 'custom' && customEndDate ? new Date(customEndDate).toISOString() : undefined,
				groupBy
			};

			const response = await fetch('/api/admin/reports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await response.json();
			
			if (data.success) {
				reportData = data.report;
				// Generate and download PDF
				await downloadPDF(data.report);
			} else {
				alert('Error generating report: ' + data.error);
			}
		} catch (error) {
			console.error('Error generating report:', error);
			alert('Error generating report. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	async function downloadPDF(report: any) {
		try {
			// Import jsPDF dynamically to avoid SSR issues
			const jsPDFModule = await import('jspdf');
			const autoTableModule = await import('jspdf-autotable');
			const jsPDF = jsPDFModule.default;
			const isWide = selectedReportType === 'detailed';
			const doc = new jsPDF({ unit: 'pt', orientation: isWide ? 'landscape' : 'portrait' });
			const pageWidth = doc.internal.pageSize.getWidth();
			let y = 40;
			
			// Brand header
			doc.setFillColor(233, 30, 99); // accent
			doc.rect(0, 0, pageWidth, 60, 'F');
			doc.setFontSize(18);
			doc.setTextColor(255, 255, 255);
			doc.text('Studio Inventory', 40, 38);
			doc.setFontSize(11);
			doc.text(`Report: ${selectedReportType.toUpperCase()}`, 40, 56);
			doc.setTextColor(33, 33, 33);
			y = 90;
			
			// Meta
			doc.setFontSize(12);
			doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y);
			y += 18;
			doc.text(`Total Assets: ${report.totalAssets}`, 40, y);
			y += 8;
			
			// Divider
			doc.setDrawColor(233, 30, 99);
			doc.line(40, y + 12, pageWidth - 40, y + 12);
			y += 28;
			
			// Summary sections as tables
			if (report.summary && selectedReportType === 'summary') {
				const catRows = Object.entries(report.summary.categoryBreakdown || {}).map(([k, v]: any) => ({ type: k, count: v }));
				doc.setFontSize(14);
				doc.text('Category Breakdown', 40, y); y += 10;
				// @ts-ignore
				autoTableModule.default(doc, {
					startY: y,
					head: [['Category', 'Count']],
					body: catRows.map(r => [r.type, r.count]),
					styles: { fontSize: 10, cellPadding: 6 },
					headStyles: { fillColor: [233, 30, 99], textColor: 255, fontStyle: 'bold' },
					margin: { left: 40, right: 40 }
				});
				// @ts-ignore
				y = (doc as any).lastAutoTable.finalY + 20;

				const statRows = Object.entries(report.summary.statusBreakdown || {}).map(([k, v]: any) => ({ status: k, count: v }));
				doc.setFontSize(14);
				doc.text('Status Breakdown', 40, y); y += 10;
				// @ts-ignore
				autoTableModule.default(doc, {
					startY: y,
					head: [['Status', 'Count']],
					body: statRows.map(r => [r.status, r.count]),
					styles: { fontSize: 10, cellPadding: 6 },
					headStyles: { fillColor: [33, 33, 33], textColor: 255, fontStyle: 'bold' },
					margin: { left: 40, right: 40 }
				});
				// @ts-ignore
				y = (doc as any).lastAutoTable.finalY + 24;
			}
			
			// Detailed assets table only for Detailed report
			if (selectedReportType === 'detailed' && Array.isArray(report.assets) && report.assets.length > 0) {
				const columns = [
					{ header: 'Name', dataKey: 'name' },
					{ header: 'Category', dataKey: 'category' },
					{ header: 'Qty', dataKey: 'quantity' },
					{ header: 'Status', dataKey: 'status' },
					{ header: 'Location', dataKey: 'location' },
					{ header: 'Room', dataKey: 'room' },
					{ header: 'Brand', dataKey: 'modelBrand' },
					{ header: 'Supplier', dataKey: 'supplier' },
					{ header: 'Asset #', dataKey: 'assetNumber' },
					{ header: 'Cable Type', dataKey: 'cableType' },
					{ header: 'Length', dataKey: 'cableLength' },
					{ header: 'Serials', dataKey: 'serials' },
					{ header: 'Purchased', dataKey: 'purchaseDate' },
					{ header: 'Price', dataKey: 'purchasePrice' }
				];
				const rows = report.assets.map((a: any) => ({
					name: a.name,
					category: a.category,
					quantity: a.quantity,
					status: a.status,
					location: a.location,
					room: a.room,
					modelBrand: a.modelBrand,
					supplier: a.supplier,
					assetNumber: a.assetNumber,
					cableType: a.cableType,
					cableLength: a.cableLength ?? '',
					serials: Array.isArray(a.serialNumbers) ? a.serialNumbers.join(', ') : '',
					purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
					purchasePrice: a.purchasePrice ? `$${Number(a.purchasePrice).toFixed(2)}` : ''
				}));
				
				// @ts-ignore - plugin augments doc
				autoTableModule.default(doc, {
					startY: y,
					head: [columns.map(c => c.header)],
					body: rows.map(r => columns.map(c => r[c.dataKey as keyof typeof r] as any)),
					styles: { fontSize: 9, cellPadding: 6, overflow: 'ellipsize' },
					headStyles: { fillColor: [233, 30, 99], textColor: 255, fontStyle: 'bold' },
					alternateRowStyles: { fillColor: [250, 250, 250] },
					margin: { left: 40, right: 40 },
					columnStyles: {
						0: { cellWidth: 170 }, // Name
						1: { cellWidth: 90 },  // Category
						2: { cellWidth: 40, halign: 'right' }, // Qty
						3: { cellWidth: 70 },  // Status
						4: { cellWidth: 110 }, // Location
						5: { cellWidth: 90 },  // Room
						6: { cellWidth: 100 }, // Brand
						7: { cellWidth: 100 }, // Supplier
						8: { cellWidth: 70 },  // Asset #
						9: { cellWidth: 100 }, // Cable Type
						10:{ cellWidth: 60, halign: 'right' }, // Length
						11:{ cellWidth: 180 }, // Serials
						12:{ cellWidth: 80 },  // Purchased
						13:{ cellWidth: 70, halign: 'right' } // Price
					}
				});
				// Update y to after table
				// @ts-ignore
				y = (doc as any).lastAutoTable.finalY + 24;
			}

			// Cables report table
			if (selectedReportType === 'cables' && report.cables && report.cables.byType) {
				doc.setFontSize(14);
				doc.text('Cable Type Totals', 40, y);
				y += 12;
				doc.setFontSize(10);
				doc.text(`Types: ${report.cables.typesCount ?? Object.keys(report.cables.byType).length}  |  Total Cables: ${report.cables.totalCableAssets ?? ''}  |  Total Length: ${report.cables.totalCableLength ?? ''}`.trim(), 40, y);
				y += 10;
				const cableColumns = [
					{ header: 'Cable Type', dataKey: 'type' },
					{ header: 'Total Cables', dataKey: 'totalCables' },
					{ header: 'Total Length', dataKey: 'totalLength' },
					{ header: 'Avg Length', dataKey: 'avgLength' },
					{ header: 'Min', dataKey: 'minLength' },
					{ header: 'Max', dataKey: 'maxLength' },
					{ header: 'Bulk Remaining', dataKey: 'bulkRemainingLength' }
				];
				const cableRows = Object.entries(report.cables.byType).map(([type, stats]: any) => ({
					type,
					totalCables: stats.totalCables,
					totalLength: stats.totalLength,
					avgLength: stats.avgLength ? Number(stats.avgLength).toFixed(2) : '0',
					minLength: stats.minLength,
					maxLength: stats.maxLength,
					bulkRemainingLength: stats.bulkRemainingLength || 0
				}));
				// @ts-ignore
				autoTableModule.default(doc, {
					startY: y,
					head: [cableColumns.map(c => c.header)],
					body: cableRows.map(r => cableColumns.map(c => r[c.dataKey as keyof typeof r] as any)),
					styles: { fontSize: 9, cellPadding: 6 },
					headStyles: { fillColor: [33, 33, 33], textColor: 255, fontStyle: 'bold' },
					alternateRowStyles: { fillColor: [245, 245, 245] },
					margin: { left: 40, right: 40 }
				});
				// @ts-ignore
				y = (doc as any).lastAutoTable.finalY + 24;

				// Per-type detailed items (Name, Length, Cost, Qty)
				const typeEntries: [string, any][] = Object.entries(report.cables.byType);
				for (const [typeName] of typeEntries) {
					if (y > doc.internal.pageSize.getHeight() - 200) { doc.addPage(); y = 60; }
					doc.setFontSize(13);
					doc.text(typeName, 40, y);
					y += 12;
					let items: any[] = [];
					if (report.cables.detailByType && report.cables.detailByType[typeName]) {
						items = report.cables.detailByType[typeName].map((row: any) => ({
							name: row.name,
							length: row.length,
							cost: row.cost,
							qty: row.qty
						}));
					} else {
						items = (report.assets || []).filter((a: any) => a.cableType === typeName).map((a: any) => ({
							name: a.name,
							length: a.cableLength ?? '',
							cost: a.purchasePrice ? Number(a.purchasePrice) : 0,
							qty: a.quantity ?? 0
						}));
					}
					if (items.length === 0) { continue; }
					const itemCols = [
						{ header: 'Name', dataKey: 'name' },
						{ header: 'Length', dataKey: 'length' },
						{ header: 'Cost', dataKey: 'cost' },
						{ header: 'Qty', dataKey: 'qty' }
					];
					const itemRows = items.map((a: any) => ({
						name: a.name,
						length: a.length ?? '',
						cost: a.cost ? `$${Number(a.cost).toFixed(2)}` : '',
						qty: a.qty ?? 0
					}));
					// @ts-ignore
					autoTableModule.default(doc, {
						startY: y,
						head: [itemCols.map(c => c.header)],
						body: itemRows.map(r => itemCols.map(c => r[c.dataKey as keyof typeof r] as any)),
						styles: { fontSize: 9, cellPadding: 6 },
						headStyles: { fillColor: [233, 30, 99], textColor: 255, fontStyle: 'bold' },
						alternateRowStyles: { fillColor: [250, 250, 250] },
						margin: { left: 40, right: 40 },
						columnStyles: { 0: { cellWidth: 260 }, 1: { cellWidth: 80, halign: 'right' }, 2: { cellWidth: 90, halign: 'right' }, 3: { cellWidth: 50, halign: 'right' } }
					});
					// @ts-ignore
					y = (doc as any).lastAutoTable.finalY + 20;
				}
			}

			// Category group tables
			if (groupBy === 'category' && report.categoryGroups) {
				for (const [categoryName, stats] of Object.entries(report.categoryGroups as Record<string, any>)) {
					if (y > doc.internal.pageSize.getHeight() - 200) { doc.addPage(); y = 60; }
					doc.setFontSize(14);
					doc.text(`Category: ${categoryName}`, 40, y); y += 14;
					doc.setFontSize(10);
					doc.text(`Assets: ${stats.totalAssets}  |  Quantity: ${stats.totalQuantity}  |  Value: $${Number(stats.totalValue).toFixed(2)}`, 40, y); y += 10;
					const catCols = [
						{ header: 'Name', dataKey: 'name' },
						{ header: 'Qty', dataKey: 'quantity' },
						{ header: 'Status', dataKey: 'status' },
						{ header: 'Location', dataKey: 'location' },
						{ header: 'Serials', dataKey: 'serials' }
					];
					const catRows = (report.assets || []).filter((a: any) => a.category === categoryName).map((a: any) => ({
						name: a.name,
						quantity: a.quantity,
						status: a.status,
						location: a.location,
						serials: Array.isArray(a.serialNumbers) ? a.serialNumbers.join(', ') : ''
					}));
					// @ts-ignore
					autoTableModule.default(doc, {
						startY: y,
						head: [catCols.map(c => c.header)],
						body: catRows.map(r => catCols.map(c => r[c.dataKey as keyof typeof r] as any)),
						styles: { fontSize: 9, cellPadding: 6 },
						headStyles: { fillColor: [33, 33, 33], textColor: 255, fontStyle: 'bold' },
						alternateRowStyles: { fillColor: [245, 245, 245] },
						margin: { left: 40, right: 40 }
					});
					// @ts-ignore
					y = (doc as any).lastAutoTable.finalY + 24;
				}
			}
			
			// Footer
			const pageCount = (doc as any).internal.getNumberOfPages();
			for (let i = 1; i <= pageCount; i++) {
				doc.setPage(i);
				doc.setFontSize(9);
				doc.setTextColor(120);
				doc.text(`Page ${i} of ${pageCount}`, pageWidth - 100, doc.internal.pageSize.getHeight() - 20);
			}
			
			doc.save(`asset-report-${new Date().toISOString().split('T')[0]}.pdf`);
			
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Error generating PDF. Please try again.');
		}
	}

	function getReportDescription() {
		const descriptions = {
			summary: 'Overview of all assets with counts by category and type',
			detailed: 'Comprehensive list of all assets with full details',
			financial: 'Financial summary including purchase costs and maintenance expenses',
			maintenance: 'Maintenance history and upcoming scheduled maintenance',
			location: 'Asset distribution by location and room',
			cables: 'Totals per cable type with lengths (min/max/avg), and bulk remaining'
		};
		return descriptions[selectedReportType as keyof typeof descriptions] || '';
	}
</script>

<svelte:head>
	<title>Reports - Admin - Studio Inventory</title>
</svelte:head>

<div class="space-y-8">
	<SectionHeader 
		title="Asset Reports" 
		subtitle="Generate comprehensive PDF reports of your inventory assets"
	/>

	<!-- Report Configuration -->
	<Card>
		<div class="space-y-6">
			<h3 class="text-lg font-semibold text-primary">Report Configuration</h3>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<!-- Report Type -->
				<div class="space-y-2">
					<label class="text-sm font-medium text-secondary">Report Type</label>
					<Select 
						bind:bindValue={selectedReportType}
						options={[
							{ value: 'summary', label: 'Summary Report' },
							{ value: 'detailed', label: 'Detailed Report' },
							{ value: 'financial', label: 'Financial Report' },
							{ value: 'maintenance', label: 'Maintenance Report' },
							{ value: 'location', label: 'Location Report' },
							{ value: 'cables', label: 'Cables Report' }
						]}
					/>
					<p class="text-xs text-tertiary">{getReportDescription()}</p>
				</div>

				<!-- Category Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium text-secondary">Categories (Multi-select)</label>
					<select multiple bind:value={selectedCategories} class="w-full rounded-lg border border-input bg-input text-input focus:ring-2 focus:ring-accent focus:border-accent/50 px-4 py-2 min-h-[120px]">
						{#each categories as cat}
							<option value={cat.id.toString()}>{cat.name}</option>
						{/each}
					</select>
					<p class="text-xs text-tertiary">Leave empty to include all categories.</p>
				</div>

				<!-- Cable Type Filter -->
				<div class="space-y-2">
					<label class="text-sm font-medium text-secondary">Cable Type Filter</label>
					<Select 
						bind:bindValue={selectedCableType}
						options={[
							{ value: 'all', label: 'All Cable Types' },
							...cableTypes.map(ct => ({ value: ct.id.toString(), label: ct.name }))
						]}
					/>
				</div>

				<!-- Date Range -->
				<div class="space-y-2">
					<label class="text-sm font-medium text-secondary">Date Range</label>
					<Select 
						bind:bindValue={dateRange}
						options={[
							{ value: 'all', label: 'All Time' },
							{ value: 'thisMonth', label: 'This Month' },
							{ value: 'thisYear', label: 'This Year' },
							{ value: 'custom', label: 'Custom Range' }
						]}
					/>
				</div>

				<!-- Custom Date Range -->
				{#if dateRange === 'custom'}
					<div class="space-y-2">
						<label class="text-sm font-medium text-secondary">Start Date</label>
						<Input 
							type="date" 
							bind:value={customStartDate}
							placeholder="Start date"
						/>
					</div>

					<div class="space-y-2">
						<label class="text-sm font-medium text-secondary">End Date</label>
						<Input 
							type="date" 
							bind:value={customEndDate}
							placeholder="End date"
						/>
					</div>
				{/if}
			</div>

			<!-- Generate Button -->
			<div class="flex justify-center pt-4">
				<Button 
					onclick={generateReport}
					disabled={isLoading}
					className="px-8 py-3 bg-gradient-to-r from-accent-error to-red-500 hover:from-accent-error/90 hover:to-red-500/90 text-white font-semibold rounded-xl shadow-custom-lg hover:shadow-custom-xl transition-all duration-200 transform hover:scale-105"
				>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Generating Report...
					{:else}
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Generate PDF Report
					{/if}
				</Button>
			</div>
		</div>
	</Card>

	<!-- Report Preview -->
	{#if reportData}
		<Card>
			<div class="space-y-4">
				<h3 class="text-lg font-semibold text-primary">Report Preview</h3>
				
				<div class="bg-tertiary rounded-lg p-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div>
							<span class="font-medium text-secondary">Total Assets:</span>
							<span class="ml-2 text-primary">{reportData.totalAssets}</span>
						</div>
						<div>
							<span class="font-medium text-secondary">Categories:</span>
							<span class="ml-2 text-primary">{reportData.categoryCount}</span>
						</div>
						<div>
							<span class="font-medium text-secondary">Generated:</span>
							<span class="ml-2 text-primary">{new Date(reportData.generatedAt).toLocaleString()}</span>
						</div>
					</div>
				</div>

				{#if reportData.summary}
					<div class="space-y-4">
						<h4 class="font-medium text-secondary">Summary</h4>
						{#if reportData.summary.totalValue !== undefined}
							<div class="p-3 bg-tertiary rounded-lg flex items-center justify-between">
								<span class="text-sm text-secondary">Total Value</span>
								<span class="font-semibold text-primary">{new Intl.NumberFormat(undefined,{ style:'currency', currency:'USD' }).format(Number(reportData.summary.totalValue) || 0)}</span>
							</div>
						{/if}

						{#if reportData.summary.categoryBreakdown}
							<div>
								<p class="text-sm font-medium text-secondary mb-2">Category Breakdown</p>
								<div class="space-y-2">
									{#each Object.entries(reportData.summary.categoryBreakdown) as [k, v]}
										<div class="flex items-center justify-between bg-tertiary rounded-lg px-3 py-2">
											<span class="text-sm text-secondary">{k}</span>
											<span class="text-sm font-semibold text-primary">{v}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if reportData.summary.statusBreakdown}
							<div>
								<p class="text-sm font-medium text-secondary mb-2">Status Breakdown</p>
								<div class="space-y-2">
									{#each Object.entries(reportData.summary.statusBreakdown) as [k, v]}
										<div class="flex items-center justify-between bg-tertiary rounded-lg px-3 py-2">
											<span class="text-sm text-secondary">{k}</span>
											<span class="text-sm font-semibold text-primary">{v}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</Card>
	{/if}

	<!-- Report Templates Info -->
	<Card>
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-primary">Available Report Types</h3>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-3">
					<h4 class="font-medium text-secondary flex items-center">
						<svg class="w-5 h-5 mr-2 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Summary Report
					</h4>
					<p class="text-sm text-tertiary">Quick overview with asset counts, category breakdowns, and key metrics for executive summaries.</p>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium text-secondary flex items-center">
						<svg class="w-5 h-5 mr-2 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Detailed Report
					</h4>
					<p class="text-sm text-tertiary">Comprehensive asset listing with serial numbers, locations, status, and maintenance history.</p>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium text-secondary flex items-center">
						<svg class="w-5 h-5 mr-2 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
						</svg>
						Financial Report
					</h4>
					<p class="text-sm text-tertiary">Cost analysis including purchase prices, maintenance expenses, and depreciation tracking.</p>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium text-secondary flex items-center">
						<svg class="w-5 h-5 mr-2 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Maintenance Report
					</h4>
					<p class="text-sm text-tertiary">Maintenance schedules, repair history, and upcoming service requirements for preventive planning.</p>
				</div>

				<div class="space-y-3">
					<h4 class="font-medium text-secondary flex items-center">
						<svg class="w-5 h-5 mr-2 text-accent-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Location Report
					</h4>
					<p class="text-sm text-tertiary">Asset distribution by location, room assignments, and movement tracking for facility management.</p>
				</div>
			</div>
		</div>
	</Card>
</div>
