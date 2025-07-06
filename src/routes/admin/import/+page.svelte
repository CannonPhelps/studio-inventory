<script lang="ts">
	import { onMount } from 'svelte';

	interface ImportType {
		value: string;
		label: string;
		description: string;
		icon: string;
	}

	interface UploadResult {
		success: boolean;
		imported?: number;
		skipped?: number;
		error?: string;
		details?: Array<{
			itemName: string;
			status: string;
			error?: string;
		}>;
	}

	let selectedFile: File | null = null;
	let importType = 'assets';
	let isUploading = false;
	let uploadProgress = 0;
	let uploadResult: UploadResult | null = null;
	let showTemplates = false;

	const importTypes: ImportType[] = [
		{ value: 'assets', label: 'Assets', description: 'Import equipment and inventory items', icon: '📦' },
		{ value: 'cableTypes', label: 'Cable Types', description: 'Import cable specifications', icon: '🔌' },
		{ value: 'bulkCables', label: 'Bulk Cables', description: 'Import bulk cable inventory', icon: '📏' }
	];

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
			uploadResult = null;
		}
	}

	async function uploadFile() {
		if (!selectedFile) return;

		isUploading = true;
		uploadProgress = 0;
		uploadResult = null;

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('importType', importType);

		try {
			const response = await fetch('/api/import', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			uploadResult = result;

			if (response.ok) {
				uploadProgress = 100;
			}
		} catch (error) {
			uploadResult = {
				success: false,
				error: 'Upload failed. Please try again.'
			};
		} finally {
			isUploading = false;
		}
	}

	async function downloadTemplate(type: string) {
		try {
			const response = await fetch(`/api/import/template/${type}`);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${type}-template.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Error downloading template:', error);
		}
	}

	function resetForm() {
		selectedFile = null;
		uploadResult = null;
		uploadProgress = 0;
		const fileInput = document.getElementById('fileInput') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}
</script>

<svelte:head>
	<title>Import Data - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-primary">Import Data</h1>
		<p class="mt-2 text-muted-foreground">Upload CSV files to import your inventory data</p>
	</div>

	<!-- Import Type Selection -->
	<div class="bg-card rounded-xl shadow-sm p-6 border border-border">
		<h2 class="text-lg font-semibold text-primary mb-4">Select Import Type</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each importTypes as type}
				<button
					on:click={() => importType = type.value}
					class="p-4 border-2 rounded-xl text-left transition-all duration-200 {importType === type.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:border-muted-foreground hover:bg-muted/50'}"
				>
					<div class="flex items-center mb-2">
						<span class="text-2xl mr-3">{type.icon}</span>
						<h3 class="font-semibold text-primary">{type.label}</h3>
					</div>
					<p class="text-sm text-muted-foreground">{type.description}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- File Upload -->
	<div class="bg-card rounded-xl shadow-sm p-6 border border-border">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-primary">Upload File</h2>
			<button
				on:click={() => showTemplates = !showTemplates}
				class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				{showTemplates ? 'Hide' : 'Show'} Templates
			</button>
		</div>

		{#if showTemplates}
			<div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
				<h3 class="font-medium text-blue-900 dark:text-blue-100 mb-3">Download CSV Templates</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					{#each importTypes as type}
						<button
							on:click={() => downloadTemplate(type.value)}
							class="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							{type.label} Template
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div class="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
			<input
				id="fileInput"
				type="file"
				accept=".csv"
				on:change={handleFileSelect}
				class="hidden"
			/>
			
			{#if !selectedFile}
				<div class="space-y-4">
					<svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
					<div>
						<label for="fileInput" class="cursor-pointer">
							<span class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Click to upload</span>
							<span class="text-muted-foreground"> or drag and drop</span>
						</label>
						<p class="text-sm text-muted-foreground">CSV files only</p>
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					<svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p class="text-sm font-medium text-primary">{selectedFile.name}</p>
						<p class="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
					</div>
					<div class="flex justify-center gap-3">
						<button
							on:click={resetForm}
							class="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
						>
							Remove
						</button>
						<button
							on:click={uploadFile}
							disabled={isUploading}
							class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
						>
							{#if isUploading}
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Uploading...
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
								Upload File
							{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>

		{#if isUploading}
			<div class="mt-6">
				<div class="flex justify-between text-sm text-muted-foreground mb-2">
					<span>Uploading...</span>
					<span>{uploadProgress}%</span>
				</div>
				<div class="w-full bg-muted rounded-full h-2">
					<div 
						class="bg-blue-600 h-2 rounded-full transition-all duration-300"
						style="width: {uploadProgress}%"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Upload Results -->
	{#if uploadResult}
		<div class="bg-card rounded-xl shadow-sm p-6 border border-border">
			<h2 class="text-lg font-semibold text-primary mb-4">Import Results</h2>
			
			{#if uploadResult.success}
				<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
					<div class="flex items-center">
						<svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<h3 class="text-sm font-medium text-green-800 dark:text-green-200">Import Successful!</h3>
							<p class="text-sm text-green-700 dark:text-green-300 mt-1">
								Successfully imported {uploadResult.imported} items.
								{#if uploadResult.skipped > 0}
									{uploadResult.skipped} items were skipped due to duplicates or errors.
								{/if}
							</p>
						</div>
					</div>
				</div>

				{#if uploadResult.details && uploadResult.details.length > 0}
					<div class="mt-4">
						<h4 class="text-sm font-medium text-primary mb-2">Import Details:</h4>
						<div class="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
							{#each uploadResult.details as detail}
								<div class="text-sm text-primary mb-1">
									<span class="font-medium">{detail.itemName}</span>
									{#if detail.status === 'imported'}
										<span class="text-green-600 dark:text-green-400">✓ Imported</span>
									{:else if detail.status === 'skipped'}
										<span class="text-yellow-600 dark:text-yellow-400">⚠ Skipped</span>
									{:else}
										<span class="text-red-600 dark:text-red-400">✗ Error: {detail.error}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div class="flex items-center">
						<svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div>
							<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Import Failed</h3>
							<p class="text-sm text-red-700 dark:text-red-300 mt-1">{uploadResult.error}</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="mt-4 flex justify-end">
				<button
					on:click={resetForm}
					class="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
				>
					Import Another File
				</button>
			</div>
		</div>
	{/if}

	<!-- Help Section -->
	<div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
		<h2 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Import Guidelines</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">File Requirements</h3>
				<ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<li>• CSV format only</li>
					<li>• First row should contain headers</li>
					<li>• Use commas to separate values</li>
					<li>• Enclose text in quotes if it contains commas</li>
				</ul>
			</div>
			<div>
				<h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for Success</h3>
				<ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<li>• Download and review the template first</li>
					<li>• Ensure required fields are filled</li>
					<li>• Check for duplicate serial numbers</li>
					<li>• Use consistent category names</li>
				</ul>
			</div>
		</div>
	</div>
</div> 