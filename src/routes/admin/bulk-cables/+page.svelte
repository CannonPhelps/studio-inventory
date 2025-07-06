<script lang="ts">
	import { onMount } from 'svelte';

	// Tab management
	let activeTab = 'bulk-cables';
	const tabs = [
		{ id: 'bulk-cables', name: 'Bulk Cables', icon: '📏' },
		{ id: 'cable-assets', name: 'Cable Assets', icon: '🔌' },
		{ id: 'cable-types', name: 'Cable Types', icon: '🔌' },
		{ id: 'cable-ends', name: 'Cable Ends', icon: '🔗' }
	];

	// Shared data
	let loading = true;

	// Bulk Cables data
	let bulkCables: any[] = [];
	let cableTypes: any[] = [];
	let cableEnds: any[] = [];
	let showAddModal = false;
	let showCreateCableModal = false;
	let editingCable: any = null;
	let selectedBulkCable: any = null;

	let newBulkCable = {
		cableTypeId: '',
		totalLength: '',
		remainingLength: '',
		location: '',
		supplier: '',
		purchaseDate: '',
		purchasePrice: '',
		notes: ''
	};

	let newCable = {
		length: '',
		customName: '',
		endAId: '',
		endBId: ''
	};

	// Cable Types data
	let showAddCableTypeModal = false;
	let editingCableType: any = null;

	let newCableType = {
		name: '',
		description: '',
		color: '',
		gauge: '',
		impedance: '',
		maxLength: ''
	};

	// Cable Ends data
	let showAddCableEndModal = false;
	let editingCableEnd: any = null;

	let newCableEnd = {
		name: '',
		type: '',
		gender: '',
		description: '',
		color: '#000000',
		quantity: 0,
		purchasePrice: '',
		supplier: '',
		purchaseDate: '',
		location: '',
		notes: ''
	};

	// Cable Assets data
	let cableAssets: any[] = [];
	let showAddCableAssetModal = false;
	let editingCableAsset: any = null;

	let newCableAsset = {
		itemName: '',
		cableTypeId: '',
		cableLength: '',
		endAId: '',
		endBId: '',
		customName: '',
		location: '',
		notes: ''
	};

	const connectorTypes = [
		// Coaxial connectors
		'BNC',
		'F-Type',
		'N-Type',
		'SMA',
		'SMB',
		'SMC',

		// Twisted pair connectors
		'RJ45',
		'RJ11',

		// Fiber optic connectors
		'SC',
		'ST',
		'LC',
		'FC',

		// Audio connectors
		'XLR',
		'RCA',
		'1/4" TRS',
		'1/4" TS',
		'3.5mm',
		'6.35mm',
		'DIN',

		// Video connectors
		'HDMI',
		'DisplayPort',
		'VGA',
		'DVI',

		// USB connectors
		'USB-A',
		'USB-B',
		'USB-C',

		// Power connectors
		'Power',
		'AC',
		'DC',
		'IEC',
		'Edison',
		'Molex',

		// Specialized connectors
		'Firewire',
		'IEEE1394',
		'Thunderbolt',
		'eSATA',
		'DB9',
		'DB25',

		'Other'
	];

	const genderOptions = ['Male', 'Female'];

	const shieldingTypes = [
		'Unshielded',
		'Foil Shielded',
		'Braided Shielded',
		'Foil + Braid',
		'Triple Shielded',
		'Quad Shielded',
		'Other'
	];

	onMount(async () => {
		await loadAllData();
	});

	async function loadAllData() {
		loading = true;
		await Promise.all([loadBulkCables(), loadCableAssets(), loadCableTypes(), loadCableEnds()]);
		loading = false;
	}

	// Bulk Cables functions
	async function loadBulkCables() {
		try {
			const response = await fetch('/api/bulk-cables');
			bulkCables = await response.json();
		} catch (error) {
			console.error('Error loading bulk cables:', error);
		}
	}

	async function loadCableTypes() {
		try {
			const response = await fetch('/api/cable-types');
			cableTypes = await response.json();
		} catch (error) {
			console.error('Error loading cable types:', error);
		}
	}

	async function loadCableEnds() {
		try {
			const response = await fetch('/api/cable-ends');
			const data = await response.json();

			if (response.ok) {
				cableEnds = data;
			} else {
				console.error('Failed to load cable ends:', data.error);
				cableEnds = getDefaultCableEnds();
			}
		} catch (error) {
			console.error('Error loading cable ends:', error);
			cableEnds = getDefaultCableEnds();
		}
	}

	function getDefaultCableEnds() {
		return [
			{
				id: 1,
				name: 'BNC Male',
				type: 'BNC',
				gender: 'Male',
				description: 'BNC Male connector',
				color: '#000000'
			},
			{
				id: 2,
				name: 'BNC Female',
				type: 'BNC',
				gender: 'Female',
				description: 'BNC Female connector',
				color: '#000000'
			},
			{
				id: 3,
				name: 'XLR Male',
				type: 'XLR',
				gender: 'Male',
				description: 'XLR Male connector',
				color: '#000000'
			},
			{
				id: 4,
				name: 'XLR Female',
				type: 'XLR',
				gender: 'Female',
				description: 'XLR Female connector',
				color: '#000000'
			},
			{
				id: 5,
				name: 'RCA Male',
				type: 'RCA',
				gender: 'Male',
				description: 'RCA Male connector',
				color: '#000000'
			},
			{
				id: 6,
				name: 'RCA Female',
				type: 'RCA',
				gender: 'Female',
				description: 'RCA Female connector',
				color: '#000000'
			},
			{
				id: 7,
				name: 'HDMI Male',
				type: 'HDMI',
				gender: 'Male',
				description: 'HDMI Male connector',
				color: '#000000'
			},
			{
				id: 8,
				name: 'HDMI Female',
				type: 'HDMI',
				gender: 'Female',
				description: 'HDMI Female connector',
				color: '#000000'
			},
			{
				id: 9,
				name: 'RJ45 Male',
				type: 'RJ45',
				gender: 'Male',
				description: 'RJ45 Male connector',
				color: '#000000'
			},
			{
				id: 10,
				name: 'RJ45 Female',
				type: 'RJ45',
				gender: 'Female',
				description: 'RJ45 Female connector',
				color: '#000000'
			}
		];
	}

	// Cable Assets functions
	async function loadCableAssets() {
		try {
			const response = await fetch('/api/assets?isCable=true');
			const assets = await response.json();

			// Filter to only show assets in the "Cable" category
			cableAssets = assets
				.filter(
					(asset: any) =>
						asset.category && asset.category.name && asset.category.name.toLowerCase() === 'cable'
				)
				.sort((a: any, b: any) => {
					// Sort by item name within the cable category
					return a.itemName.localeCompare(b.itemName);
				});
		} catch (error) {
			console.error('Error loading cable assets:', error);
		}
	}

	// Bulk Cables CRUD
	async function addBulkCable() {
		try {
			const response = await fetch('/api/bulk-cables', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newBulkCable)
			});

			if (response.ok) {
				await loadBulkCables();
				showAddModal = false;
				newBulkCable = {
					cableTypeId: '',
					totalLength: '',
					remainingLength: '',
					location: '',
					supplier: '',
					purchaseDate: '',
					purchasePrice: '',
					notes: ''
				};
			}
		} catch (error) {
			console.error('Error adding bulk cable:', error);
		}
	}

	async function updateBulkCable() {
		if (!editingCable) return;

		try {
			const response = await fetch(`/api/bulk-cables/${editingCable.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCable)
			});

			if (response.ok) {
				await loadBulkCables();
				editingCable = null;
			}
		} catch (error) {
			console.error('Error updating bulk cable:', error);
		}
	}

	async function deleteBulkCable(id: number) {
		if (!confirm('Are you sure you want to delete this bulk cable?')) return;

		try {
			const response = await fetch(`/api/bulk-cables/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadBulkCables();
			}
		} catch (error) {
			console.error('Error deleting bulk cable:', error);
		}
	}

	// Cable Types CRUD
	async function addCableType() {
		try {
			const response = await fetch('/api/cable-types', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCableType)
			});

			if (response.ok) {
				await loadCableTypes();
				showAddCableTypeModal = false;
				newCableType = {
					name: '',
					description: '',
					color: '',
					gauge: '',
					impedance: '',
					maxLength: ''
				};
			}
		} catch (error) {
			console.error('Error adding cable type:', error);
		}
	}

	async function updateCableType() {
		if (!editingCableType) return;

		try {
			const response = await fetch(`/api/cable-types/${editingCableType.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCableType)
			});

			if (response.ok) {
				await loadCableTypes();
				editingCableType = null;
			}
		} catch (error) {
			console.error('Error updating cable type:', error);
		}
	}

	async function deleteCableType(id: number) {
		if (!confirm('Are you sure you want to delete this cable type?')) return;

		try {
			const response = await fetch(`/api/cable-types/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCableTypes();
			}
		} catch (error) {
			console.error('Error deleting cable type:', error);
		}
	}

	// Cable Ends CRUD
	async function addCableEnd() {
		try {
			const response = await fetch('/api/cable-ends', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCableEnd)
			});

			if (response.ok) {
				await loadCableEnds();
				showAddCableEndModal = false;
				newCableEnd = {
					name: '',
					type: '',
					gender: '',
					description: '',
					color: '#000000',
					quantity: 0,
					purchasePrice: '',
					supplier: '',
					purchaseDate: '',
					location: '',
					notes: ''
				};
			}
		} catch (error) {
			console.error('Error adding cable end:', error);
		}
	}

	async function updateCableEnd() {
		if (!editingCableEnd) return;

		try {
			const response = await fetch(`/api/cable-ends/${editingCableEnd.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCableEnd)
			});

			if (response.ok) {
				await loadCableEnds();
				editingCableEnd = null;
			}
		} catch (error) {
			console.error('Error updating cable end:', error);
		}
	}

	async function deleteCableEnd(id: number) {
		if (!confirm('Are you sure you want to delete this cable end?')) return;

		try {
			const response = await fetch(`/api/cable-ends/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCableEnds();
			}
		} catch (error) {
			console.error('Error deleting cable end:', error);
		}
	}

	// Cable Assets CRUD
	async function addCableAsset() {
		try {
			// First create the cable assembly
			const assemblyData = {
				cableTypeId: parseInt(newCableAsset.cableTypeId),
				endAId: parseInt(newCableAsset.endAId),
				endBId: parseInt(newCableAsset.endBId),
				length: parseFloat(newCableAsset.cableLength),
				customName: newCableAsset.customName || null
			};

			const assemblyResponse = await fetch('/api/cable-assemblies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(assemblyData)
			});

			if (assemblyResponse.ok) {
				const assembly = await assemblyResponse.json();

				// Then create the asset
				const assetData = {
					itemName: newCableAsset.itemName,
					categoryId: 1, // Default category for cables
					cableTypeId: parseInt(newCableAsset.cableTypeId),
					cableLength: parseFloat(newCableAsset.cableLength),
					location: newCableAsset.location || null,
					notes: newCableAsset.notes || null,
					isCable: true,
					status: 'Available'
				};

				const assetResponse = await fetch('/api/assets', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(assetData)
				});

				if (assetResponse.ok) {
					const asset = await assetResponse.json();

					// Link the assembly to the asset
					await fetch(`/api/cable-assemblies/${assembly.id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ assetId: asset.id })
					});

					await loadCableAssets();
					showAddCableAssetModal = false;
					newCableAsset = {
						itemName: '',
						cableTypeId: '',
						cableLength: '',
						endAId: '',
						endBId: '',
						customName: '',
						location: '',
						notes: ''
					};
				}
			}
		} catch (error) {
			console.error('Error adding cable asset:', error);
		}
	}

	async function updateCableAsset() {
		if (!editingCableAsset) return;

		try {
			const response = await fetch(`/api/assets/${editingCableAsset.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingCableAsset)
			});

			if (response.ok) {
				await loadCableAssets();
				editingCableAsset = null;
			}
		} catch (error) {
			console.error('Error updating cable asset:', error);
		}
	}

	async function deleteCableAsset(id: number) {
		if (!confirm('Are you sure you want to delete this cable asset?')) return;

		try {
			const response = await fetch(`/api/assets/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadCableAssets();
			}
		} catch (error) {
			console.error('Error deleting cable asset:', error);
		}
	}

	// Utility functions
	function startEdit(item: any, type: string) {
		if (type === 'bulk-cable') editingCable = { ...item };
		if (type === 'cable-type') editingCableType = { ...item };
		if (type === 'cable-end') editingCableEnd = { ...item };
		if (type === 'cable-asset') editingCableAsset = { ...item };
	}

	function cancelEdit(type: string) {
		if (type === 'bulk-cable') editingCable = null;
		if (type === 'cable-type') editingCableType = null;
		if (type === 'cable-end') editingCableEnd = null;
		if (type === 'cable-asset') editingCableAsset = null;
	}

	function getUsagePercentage(remaining: number, total: number) {
		if (!total || total === 0) return 0;
		return Math.round(((total - remaining) / total) * 100);
	}

	function getUsageColor(percentage: number) {
		if (percentage < 25) return 'bg-green-600';
		if (percentage < 75) return 'bg-yellow-600';
		return 'bg-red-600';
	}

	function getCableTypeName(cableTypeId: number) {
		const cableType = cableTypes.find((ct) => ct.id === cableTypeId);
		return cableType?.name || 'Unknown';
	}

	function getCableTypeColor(cableTypeId: number) {
		const cableType = cableTypes.find((ct) => ct.id === cableTypeId);
		return cableType?.color || '#6B7280';
	}

	function getTypeColor(type: string) {
		const colors: { [key: string]: string } = {
			BNC: '#FF6B6B',
			XLR: '#4ECDC4',
			RCA: '#45B7D1',
			HDMI: '#96CEB4',
			RJ45: '#FFEAA7',
			'USB-A': '#DDA0DD',
			'USB-B': '#98D8C8',
			'USB-C': '#F7DC6F',
			Power: '#BB8FCE',
			AC: '#85C1E9',
			DC: '#F8C471'
		};
		return colors[type] || '#6B7280';
	}

	function getCompatibleCableEnds() {
		if (!selectedBulkCable) return [];

		const cableType = cableTypes.find((ct) => ct.id === selectedBulkCable.cableTypeId);
		if (!cableType) return cableEnds;

		return cableEnds.filter((end) => {
			const cableTypeName = cableType.name.toLowerCase();
			const endType = end.type.toLowerCase();

			// Direct type matching
			if (cableTypeName.includes(endType) || endType.includes(cableTypeName)) {
				return true;
			}

			// Comprehensive cable type to connector mappings
			const cableTypeMappings = {
				sdi: ['bnc'],
				ethernet: ['rj45'],
				xlr: ['xlr'],
				hdmi: ['hdmi'],
				power: ['power', 'ac', 'dc', 'iec', 'edison'],
				usb: ['usb-a', 'usb-b', 'usb-c'],
				audio: ['xlr', 'rca', '1/4" trs', '1/4" ts', '3.5mm'],
				video: ['bnc', 'rca', 'dvi', 'hdmi', 'vga']
			};

			for (const [cableTypeKey, compatibleEnds] of Object.entries(cableTypeMappings)) {
				if (cableTypeName.includes(cableTypeKey)) {
					return compatibleEnds.some(
						(compatibleEnd) => endType.includes(compatibleEnd) || compatibleEnd.includes(endType)
					);
				}
			}

			return false;
		});
	}

	async function createCableFromBulk() {
		if (!selectedBulkCable || !newCable.length || !newCable.endAId || !newCable.endBId) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			const response = await fetch('/api/bulk-cables/create-cable', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bulkCableId: selectedBulkCable.id,
					length: parseFloat(newCable.length),
					customName: newCable.customName,
					endAId: parseInt(newCable.endAId),
					endBId: parseInt(newCable.endBId)
				})
			});

			const result = await response.json();

			if (response.ok) {
				selectedBulkCable.remainingLength = result.remainingLength;
				await loadBulkCables();
				await loadCableAssets(); // Refresh cable assets list
				showCreateCableModal = false;
				selectedBulkCable = null;
				newCable = {
					length: '',
					customName: '',
					endAId: '',
					endBId: ''
				};

				const costBreakdown = [];
				if (result.cableCost) {
					costBreakdown.push(`Cable: $${result.cableCost.toFixed(2)}`);
				}
				if (result.connectorCosts.endA.cost > 0) {
					costBreakdown.push(
						`${result.connectorCosts.endA.name}: $${result.connectorCosts.endA.cost.toFixed(2)}`
					);
				}
				if (result.connectorCosts.endB.cost > 0) {
					costBreakdown.push(
						`${result.connectorCosts.endB.name}: $${result.connectorCosts.endB.cost.toFixed(2)}`
					);
				}

				const costMessage = result.totalCost
					? `Total Cost: $${result.totalCost.toFixed(2)}\n${costBreakdown.join('\n')}`
					: 'Cost: Not available';

				alert(
					`Cable created successfully!\n\nAsset: ${result.asset.itemName}\n${costMessage}\nRemaining bulk length: ${result.remainingLength.toFixed(1)}ft`
				);
			} else {
				alert(result.error || 'Failed to create cable');
			}
		} catch (error) {
			console.error('Error creating cable:', error);
			alert('Failed to create cable. Please try again.');
		}
	}

	function openCreateCableModal(bulkCable: any) {
		selectedBulkCable = bulkCable;
		showCreateCableModal = true;
	}
</script>

<svelte:head>
	<title>Cable Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Cable Management</h1>
			<p class="mt-2 text-gray-600">Manage bulk cables, cable types, and cable ends</p>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<nav class="-mb-px flex space-x-8">
			{#each tabs as tab}
				<button
					on:click={() => (activeTab = tab.id)}
					class="border-b-2 px-1 py-2 text-sm font-medium transition-colors {activeTab === tab.id
						? 'border-red-500 text-red-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					<span class="mr-2">{tab.icon}</span>
					{tab.name}
				</button>
			{/each}
		</nav>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
		</div>
	{:else}
		<!-- Tab Content -->
		{#if activeTab === 'bulk-cables'}
			<!-- Bulk Cables Tab -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">Bulk Cables</h2>
					<button
						on:click={() => (showAddModal = true)}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Bulk Cable
					</button>
				</div>

				{#if bulkCables.length === 0}
					<div class="py-12 text-center">
						<div class="mb-4 text-gray-400">
							<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No bulk cables yet</h3>
						<p class="mb-4 text-gray-500">
							Add your first bulk cable to start tracking cable inventory.
						</p>
						<button
							on:click={() => (showAddModal = true)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Bulk Cable
						</button>
					</div>
				{:else}
					<!-- Bulk Cables Grid -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each bulkCables as cable}
							{@const usagePercentage = getUsagePercentage(
								cable.remainingLength,
								cable.totalLength
							)}
							{@const usageColor = getUsageColor(usagePercentage)}
							<div
								class="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="p-6">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-2 flex items-center">
												<div
													class="mr-2 h-3 w-3 rounded-full"
													style="background-color: {getCableTypeColor(cable.cableTypeId)}"
												></div>
												<h3 class="text-lg font-semibold text-gray-900">
													{getCableTypeName(cable.cableTypeId)}
												</h3>
											</div>
											<p class="text-sm text-gray-500">{cable.location || 'No location'}</p>
										</div>
										<div class="flex items-center space-x-2">
											<button
												on:click={() => openCreateCableModal(cable)}
												class="rounded p-1 text-green-600 hover:text-green-800"
												title="Create Cable"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
											</button>
											<button
												on:click={() => startEdit(cable, 'bulk-cable')}
												class="rounded p-1 text-blue-600 hover:text-blue-800"
												title="Edit"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												on:click={() => deleteBulkCable(cable.id)}
												class="rounded p-1 text-red-600 hover:text-red-800"
												title="Delete"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>

									<!-- Usage Progress Bar -->
									<div class="mb-4">
										<div class="mb-1 flex justify-between text-sm text-gray-600">
											<span>Usage</span>
											<span>{usagePercentage}%</span>
										</div>
										<div class="h-2 w-full rounded-full bg-gray-200">
											<div
												class="h-2 rounded-full transition-all duration-300 {usageColor}"
												style="width: {usagePercentage}%"
											></div>
										</div>
										<div class="mt-1 flex justify-between text-xs text-gray-500">
											<span
												>{cable.remainingLength ? cable.remainingLength.toFixed(1) : '0'} ft remaining</span
											>
											<span>{cable.totalLength ? cable.totalLength.toFixed(1) : '0'} ft total</span>
										</div>
									</div>

									<div class="mb-4 space-y-2">
										{#if cable.supplier}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Supplier:</span>
												<span class="font-medium">{cable.supplier}</span>
											</div>
										{/if}
										{#if cable.purchasePrice}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Price:</span>
												<span class="font-medium">${cable.purchasePrice}</span>
											</div>
										{/if}
										{#if cable.purchaseDate}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Purchased:</span>
												<span class="font-medium"
													>{new Date(cable.purchaseDate).toLocaleDateString()}</span
												>
											</div>
										{/if}
									</div>

									{#if cable.notes}
										<div class="mb-4 rounded-lg bg-gray-50 p-3">
											<p class="text-sm text-gray-700">{cable.notes}</p>
										</div>
									{/if}

									<div class="flex items-center justify-between border-t border-gray-100 pt-4">
										<div class="flex items-center text-sm text-gray-500">
											<svg
												class="mr-1 h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
											Bulk Cable
										</div>
										<span class="text-xs text-gray-400">ID: {cable.id}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if activeTab === 'cable-types'}
			<!-- Cable Types Tab -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">Cable Types</h2>
					<button
						on:click={() => (showAddCableTypeModal = true)}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Cable Type
					</button>
				</div>

				{#if cableTypes.length === 0}
					<div class="py-12 text-center">
						<div class="mb-4 text-gray-400">
							<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No cable types yet</h3>
						<p class="mb-4 text-gray-500">
							Create your first cable type to start managing cable specifications.
						</p>
						<button
							on:click={() => (showAddCableTypeModal = true)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable Type
						</button>
					</div>
				{:else}
					<!-- Cable Types Grid -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each cableTypes as cableType}
							<div
								class="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="p-6">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<h3 class="mb-1 text-lg font-semibold text-gray-900">{cableType.name}</h3>
											{#if cableType.color}
												<div class="flex items-center text-sm text-gray-600">
													<div
														class="mr-2 h-3 w-3 rounded-full"
														style="background-color: {cableType.color}"
													></div>
													{cableType.color}
												</div>
											{/if}
										</div>
										<div class="flex items-center space-x-2">
											<button
												on:click={() => startEdit(cableType, 'cable-type')}
												class="rounded p-1 text-blue-600 hover:text-blue-800"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												on:click={() => deleteCableType(cableType.id)}
												class="rounded p-1 text-red-600 hover:text-red-800"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>

									{#if cableType.description}
										<p class="mb-4 text-sm text-gray-600">{cableType.description}</p>
									{/if}

									<div class="space-y-2">
										{#if cableType.gauge}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Gauge:</span>
												<span class="font-medium">{cableType.gauge}</span>
											</div>
										{/if}
										{#if cableType.impedance}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Impedance:</span>
												<span class="font-medium">{cableType.impedance}</span>
											</div>
										{/if}
										{#if cableType.maxLength}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Max Length:</span>
												<span class="font-medium">{cableType.maxLength}ft</span>
											</div>
										{/if}
									</div>

									<div class="flex items-center justify-between border-t border-gray-100 pt-4">
										<div class="flex items-center text-sm text-gray-500">
											<svg
												class="mr-1 h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
											Cable Type
										</div>
										<span class="text-xs text-gray-400">ID: {cableType.id}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if activeTab === 'cable-assets'}
			<!-- Cable Assets Tab -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">Cable Assets</h2>
					<button
						on:click={() => (showAddCableAssetModal = true)}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Cable Asset
					</button>
				</div>

				{#if cableAssets.length === 0}
					<div class="py-12 text-center">
						<div class="mb-4 text-gray-400">
							<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No cable assets yet</h3>
						<p class="mb-4 text-gray-500">
							Create your first cable asset to start managing individual cables.
						</p>
						<button
							on:click={() => (showAddCableAssetModal = true)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable Asset
						</button>
					</div>
				{:else}
					<!-- Cable Assets Grid -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each cableAssets as asset}
							<div
								class="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="p-6">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<h3 class="mb-1 text-lg font-semibold text-gray-900">{asset.itemName}</h3>
											<div class="mb-2 flex items-center text-sm text-gray-600">
												<div
													class="mr-2 h-3 w-3 rounded-full"
													style="background-color: {getCableTypeColor(asset.cableTypeId)}"
												></div>
												{getCableTypeName(asset.cableTypeId)}
											</div>
											<p class="text-sm text-gray-500">
												{asset.cableLength ? asset.cableLength.toFixed(1) : '0'}ft
											</p>
											{#if asset.category}
												<p class="mt-1 text-xs text-gray-400">Category: {asset.category.name}</p>
											{/if}
										</div>
										<div class="flex items-center space-x-2">
											<button
												on:click={() => startEdit(asset, 'cable-asset')}
												class="rounded p-1 text-blue-600 hover:text-blue-800"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												on:click={() => deleteCableAsset(asset.id)}
												class="rounded p-1 text-red-600 hover:text-red-800"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>

									<div class="mb-4 space-y-2">
										<div class="flex justify-between text-sm">
											<span class="text-gray-600">Status:</span>
											<span
												class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {asset.status ===
												'Available'
													? 'bg-green-100 text-green-800'
													: asset.status === 'In Use'
														? 'bg-blue-100 text-blue-800'
														: 'bg-gray-100 text-gray-800'}"
											>
												{asset.status}
											</span>
										</div>
										{#if asset.purchasePrice}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Cost:</span>
												<span class="font-medium text-gray-900"
													>${Number(asset.purchasePrice).toFixed(2)}</span
												>
											</div>
										{/if}
										{#if asset.location}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Location:</span>
												<span class="text-gray-900">{asset.location}</span>
											</div>
										{/if}
										{#if asset.cableAssembly}
											<div class="flex justify-between text-sm">
												<span class="text-gray-600">Ends:</span>
												<span class="text-gray-900"
													>{asset.cableAssembly.endA.name} → {asset.cableAssembly.endB.name}</span
												>
											</div>
										{/if}
									</div>

									{#if asset.notes}
										<div class="mb-4 rounded-lg bg-gray-50 p-3">
											<p class="text-sm text-gray-700">{asset.notes}</p>
										</div>
									{/if}

									<div class="flex items-center justify-between border-t border-gray-100 pt-4">
										<div class="flex items-center text-sm text-gray-500">
											<svg
												class="mr-1 h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
												/>
											</svg>
											Cable Asset
										</div>
										<span class="text-xs text-gray-400">ID: {asset.id}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if activeTab === 'cable-ends'}
			<!-- Cable Ends Tab -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">Cable Ends</h2>
					<button
						on:click={() => (showAddCableEndModal = true)}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add Cable End
					</button>
				</div>

				{#if cableEnds.length === 0}
					<div class="py-12 text-center">
						<div class="mb-4 text-gray-400">
							<svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-medium text-gray-900">No cable ends yet</h3>
						<p class="mb-4 text-gray-500">
							Add your first cable end to start building cable assemblies.
						</p>
						<button
							on:click={() => (showAddCableEndModal = true)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable End
						</button>
					</div>
				{:else}
					<!-- Cable Ends Grid -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each cableEnds as cableEnd}
							<div
								class="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
							>
								<div class="p-6">
									<div class="mb-4 flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-2 flex items-center">
												<div
													class="mr-2 h-3 w-3 rounded-full"
													style="background-color: {getTypeColor(cableEnd.type)}"
												></div>
												<h3 class="text-lg font-semibold text-gray-900">{cableEnd.name}</h3>
											</div>
											<p class="text-sm text-gray-500">{cableEnd.type} • {cableEnd.gender}</p>
											<div class="mt-2 flex items-center justify-between">
												<span
													class="text-sm font-medium {cableEnd.quantity > 0
														? 'text-green-600'
														: 'text-red-600'}"
												>
													{cableEnd.quantity} in stock
												</span>
												{#if cableEnd.purchasePrice}
													<span class="text-sm text-gray-600">
														${Number(cableEnd.purchasePrice).toFixed(2)} each
													</span>
												{/if}
											</div>
										</div>
										<div class="flex items-center space-x-2">
											<button
												on:click={() => startEdit(cableEnd, 'cable-end')}
												class="rounded p-1 text-blue-600 hover:text-blue-800"
												title="Edit"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												on:click={() => deleteCableEnd(cableEnd.id)}
												class="rounded p-1 text-red-600 hover:text-red-800"
												title="Delete"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>

									{#if cableEnd.description}
										<div class="mb-4 rounded-lg bg-gray-50 p-3">
											<p class="text-sm text-gray-700">{cableEnd.description}</p>
										</div>
									{/if}

									<div class="flex items-center justify-between border-t border-gray-100 pt-4">
										<div class="flex items-center text-sm text-gray-500">
											<svg
												class="mr-1 h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
											Cable End
										</div>
										<span class="text-xs text-gray-400">ID: {cableEnd.id}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<!-- Add Bulk Cable Modal -->
{#if showAddModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Add Bulk Cable</h3>
				<form on:submit|preventDefault={addBulkCable} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cable Type</label>
						<select
							bind:value={newBulkCable.cableTypeId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Cable Type</option>
							{#each cableTypes as type}
								<option value={type.id}>{type.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Total Length (ft)</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={newBulkCable.totalLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Remaining Length (ft)</label
						>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={newBulkCable.remainingLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							bind:value={newBulkCable.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
						<input
							type="text"
							bind:value={newBulkCable.supplier}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Date</label>
						<input
							type="date"
							bind:value={newBulkCable.purchaseDate}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Price</label>
						<input
							type="number"
							step="0.01"
							bind:value={newBulkCable.purchasePrice}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
						<textarea
							bind:value={newBulkCable.notes}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => (showAddModal = false)}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Bulk Cable Modal -->
{#if editingCable}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Edit Bulk Cable</h3>
				<form on:submit|preventDefault={updateBulkCable} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cable Type</label>
						<select
							bind:value={editingCable.cableTypeId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Cable Type</option>
							{#each cableTypes as type}
								<option value={type.id}>{type.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Total Length (ft)</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={editingCable.totalLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Remaining Length (ft)</label
						>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={editingCable.remainingLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							bind:value={editingCable.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
						<input
							type="text"
							bind:value={editingCable.supplier}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Date</label>
						<input
							type="date"
							bind:value={editingCable.purchaseDate}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Price</label>
						<input
							type="number"
							step="0.01"
							bind:value={editingCable.purchasePrice}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
						<textarea
							bind:value={editingCable.notes}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => cancelEdit('bulk-cable')}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Update Cable
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Create Cable Modal -->
{#if showCreateCableModal && selectedBulkCable}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Create Cable from Bulk</h3>
				<p class="mb-4 text-sm text-gray-600">
					Creating cable from: {getCableTypeName(selectedBulkCable.cableTypeId)} ({selectedBulkCable.remainingLength
						? selectedBulkCable.remainingLength.toFixed(1)
						: '0'}ft remaining)
				</p>

				{#if selectedBulkCable.purchasePrice && selectedBulkCable.totalLength}
					{@const costPerFoot =
						parseFloat(selectedBulkCable.purchasePrice.toString()) / selectedBulkCable.totalLength}
					{@const estimatedCableCost = newCable.length
						? parseFloat(newCable.length) * costPerFoot
						: 0}
					{@const endA = cableEnds.find((end) => end.id === parseInt(newCable.endAId))}
					{@const endB = cableEnds.find((end) => end.id === parseInt(newCable.endBId))}
					{@const endACost = endA?.purchasePrice ? parseFloat(endA.purchasePrice.toString()) : 0}
					{@const endBCost = endB?.purchasePrice ? parseFloat(endB.purchasePrice.toString()) : 0}
					{@const totalEstimatedCost = estimatedCableCost + endACost + endBCost}

					<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
						<p class="text-sm text-blue-800">
							<strong>Cost Preview:</strong><br />
							Bulk cable cost: ${selectedBulkCable.purchasePrice}<br />
							Cost per foot: ${costPerFoot.toFixed(2)}<br />
							{#if newCable.length}
								Estimated cable cost: <strong>${estimatedCableCost.toFixed(2)}</strong><br />
							{/if}
							{#if endA}
								Connector A ({endA.name}): ${endACost.toFixed(2)}
								{endA.quantity > 0 ? '✅' : '❌ Out of stock'}<br />
							{/if}
							{#if endB}
								Connector B ({endB.name}): ${endBCost.toFixed(2)}
								{endB.quantity > 0 ? '✅' : '❌ Out of stock'}<br />
							{/if}
							{#if newCable.length && (endA || endB)}
								<strong>Total estimated cost: ${totalEstimatedCost.toFixed(2)}</strong>
							{/if}
						</p>
					</div>
				{/if}
				<form on:submit|preventDefault={createCableFromBulk} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Length (ft)</label>
						<input
							type="number"
							step="0.1"
							min="0"
							max={selectedBulkCable.remainingLength}
							bind:value={newCable.length}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="5.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700"
							>Custom Name (optional)</label
						>
						<input
							type="text"
							bind:value={newCable.customName}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">End A</label>
						<select
							bind:value={newCable.endAId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select End A</option>
							{#each getCompatibleCableEnds() as end}
								<option value={end.id}>{end.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">End B</label>
						<select
							bind:value={newCable.endBId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select End B</option>
							{#each getCompatibleCableEnds() as end}
								<option value={end.id}>{end.name}</option>
							{/each}
						</select>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => (showCreateCableModal = false)}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
						>
							Create Cable
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Add Cable Type Modal -->
{#if showAddCableTypeModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Add Cable Type</h3>
				<form on:submit|preventDefault={addCableType} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							bind:value={newCableType.name}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
						<textarea
							bind:value={newCableType.description}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Color</label>
						<input
							type="color"
							bind:value={newCableType.color}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Gauge</label>
						<input
							type="text"
							bind:value={newCableType.gauge}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Impedance</label>
						<input
							type="text"
							bind:value={newCableType.impedance}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Max Length (ft)</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={newCableType.maxLength}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="100.0"
						/>
					</div>

					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => (showAddCableTypeModal = false)}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable Type
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Cable Type Modal -->
{#if editingCableType}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Edit Cable Type</h3>
				<form on:submit|preventDefault={updateCableType} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							bind:value={editingCableType.name}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
						<textarea
							bind:value={editingCableType.description}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Color</label>
						<input
							type="color"
							bind:value={editingCableType.color}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Gauge</label>
						<input
							type="text"
							bind:value={editingCableType.gauge}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Impedance</label>
						<input
							type="text"
							bind:value={editingCableType.impedance}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Max Length (ft)</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={editingCableType.maxLength}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="100.0"
						/>
					</div>

					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => cancelEdit('cable-type')}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Update Cable Type
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Add Cable End Modal -->
{#if showAddCableEndModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Add Cable End</h3>
				<form on:submit|preventDefault={addCableEnd} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							bind:value={newCableEnd.name}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
						<select
							bind:value={newCableEnd.type}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Type</option>
							{#each connectorTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
						<select
							bind:value={newCableEnd.gender}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Gender</option>
							{#each genderOptions as gender}
								<option value={gender}>{gender}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
						<textarea
							bind:value={newCableEnd.description}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Color</label>
						<input
							type="color"
							bind:value={newCableEnd.color}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Quantity in Stock</label>
						<input
							type="number"
							min="0"
							bind:value={newCableEnd.quantity}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="0"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Price ($)</label>
						<input
							type="number"
							step="0.01"
							min="0"
							bind:value={newCableEnd.purchasePrice}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="0.00"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
						<input
							type="text"
							bind:value={newCableEnd.supplier}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Amazon, DigiKey"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Date</label>
						<input
							type="date"
							bind:value={newCableEnd.purchaseDate}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							bind:value={newCableEnd.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Storage Room A"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
						<textarea
							bind:value={newCableEnd.notes}
							rows="2"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="Additional notes"
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => (showAddCableEndModal = false)}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable End
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Cable End Modal -->
{#if editingCableEnd}
	<div class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/50">
		<div class="relative top-20 mx-auto w-max rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Edit Cable End</h3>
				<form on:submit|preventDefault={updateCableEnd} class="  ">
					<div class="flex gap-4">

					<div class="">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
							<input
								type="text"
								bind:value={editingCableEnd.name}
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
							<select
								bind:value={editingCableEnd.type}
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							>
								<option value="">Select Type</option>
								{#each connectorTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
							<select
								bind:value={editingCableEnd.gender}
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							>
								<option value="">Select Gender</option>
								{#each genderOptions as gender}
									<option value={gender}>{gender}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Description</label>
							<textarea
								bind:value={editingCableEnd.description}
								rows="3"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							></textarea>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Color</label>
							<input
								type="color"
								bind:value={editingCableEnd.color}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Quantity in Stock</label>
							<input
								type="number"
								min="0"
								bind:value={editingCableEnd.quantity}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								placeholder="0"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Price ($)</label>
							<input
								type="number"
								step="0.01"
								min="0"
								bind:value={editingCableEnd.purchasePrice}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								placeholder="0.00"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
							<input
								type="text"
								bind:value={editingCableEnd.supplier}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								placeholder="e.g., Amazon, DigiKey"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Purchase Date</label>
							<input
								type="date"
								bind:value={editingCableEnd.purchaseDate}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
							<input
								type="text"
								bind:value={editingCableEnd.location}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								placeholder="e.g., Storage Room A"
							/>
						</div>
						
					</div>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
					<textarea
						bind:value={editingCableEnd.notes}
						rows="2"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Additional notes"
					></textarea>
				</div>

					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => cancelEdit('cable-end')}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Update Cable End
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Add Cable Asset Modal -->
{#if showAddCableAssetModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Add Cable Asset</h3>
				<form on:submit|preventDefault={addCableAsset} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Name *</label>
						<input
							type="text"
							bind:value={newCableAsset.itemName}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., HDMI Cable 10ft"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cable Type *</label>
						<select
							bind:value={newCableAsset.cableTypeId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Cable Type</option>
							{#each cableTypes as type}
								<option value={type.id}>{type.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Length (ft) *</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={newCableAsset.cableLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">End A *</label>
						<select
							bind:value={newCableAsset.endAId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select End A</option>
							{#each cableEnds as end}
								<option value={end.id}>{end.name} ({end.type} {end.gender})</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">End B *</label>
						<select
							bind:value={newCableAsset.endBId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select End B</option>
							{#each cableEnds as end}
								<option value={end.id}>{end.name} ({end.type} {end.gender})</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Custom Name</label>
						<input
							type="text"
							bind:value={newCableAsset.customName}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="Optional custom name"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							bind:value={newCableAsset.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="e.g., Studio A"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
						<textarea
							bind:value={newCableAsset.notes}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="Optional notes"
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => (showAddCableAssetModal = false)}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add Cable Asset
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Cable Asset Modal -->
{#if editingCableAsset}
	<div class="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
		<div class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
			<div class="mt-3">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Edit Cable Asset</h3>
				<form on:submit|preventDefault={updateCableAsset} class="space-y-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Name *</label>
						<input
							type="text"
							bind:value={editingCableAsset.itemName}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cable Type *</label>
						<select
							bind:value={editingCableAsset.cableTypeId}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Select Cable Type</option>
							{#each cableTypes as type}
								<option value={type.id}>{type.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Length (ft) *</label>
						<input
							type="number"
							step="0.1"
							min="0"
							bind:value={editingCableAsset.cableLength}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							placeholder="10.5"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							bind:value={editingCableAsset.location}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
						<textarea
							bind:value={editingCableAsset.notes}
							rows="3"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						></textarea>
					</div>
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							on:click={() => cancelEdit('cable-asset')}
							class="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Update Cable Asset
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
