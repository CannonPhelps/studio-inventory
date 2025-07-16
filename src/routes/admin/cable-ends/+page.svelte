<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Card from '$lib/components/Card.svelte';

	interface CableEnd {
		id: number;
		name: string;
		type: string;
		gender: string;
		description?: string;
		color: string;
	}

	interface NewCableEnd {
		name: string;
		type: string;
		gender: string;
		description: string;
		color: string;
	}

	let cableEnds: CableEnd[] = [];
	let loading = true;
	let showAddModal = false;
	let editingCableEnd: CableEnd | null = null;

	let newCableEnd: NewCableEnd = {
		name: '',
		type: '',
		gender: '',
		description: '',
		color: '#000000'
	};

	const connectorTypes = [
		// Coaxial connectors
		'BNC', 'F-Type', 'N-Type', 'SMA', 'SMB', 'SMC',
		
		// Twisted pair connectors
		'RJ45', 'RJ11',
		
		// Fiber optic connectors
		'SC', 'ST', 'LC', 'FC',
		
		// Audio connectors
		'XLR', 'RCA', '1/4" TRS', '1/4" TS', '3.5mm', '6.35mm', 'DIN',
		
		// Video connectors
		'HDMI', 'DisplayPort', 'VGA', 'DVI',
		
		// USB connectors
		'USB-A', 'USB-B', 'USB-C',
		
		// Power connectors
		'Power', 'AC', 'DC', 'IEC', 'Edison', 'Molex',
		
		// Specialized connectors
		'Firewire', 'IEEE1394', 'Thunderbolt', 'eSATA', 'DB9', 'DB25',
		
		'Other'
	];

	const genderOptions = ['Male', 'Female'];

	onMount(async () => {
		await loadCableEnds();
	});

	async function loadCableEnds() {
		try {
			const response = await fetch('/api/cable-ends');
			const data = await response.json();
			
			if (response.ok) {
				cableEnds = data;
			} else {
				console.error('Failed to load cable ends:', data.error);
			}
		} catch (error) {
			console.error('Error loading cable ends:', error);
		} finally {
			loading = false;
		}
	}

	async function addCableEnd() {
		try {
			const response = await fetch('/api/cable-ends', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newCableEnd)
			});

			if (response.ok) {
				await loadCableEnds();
				showAddModal = false;
				newCableEnd = {
					name: '',
					type: '',
					gender: '',
					description: '',
					color: '#000000'
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

	function startEdit(cableEnd: CableEnd) {
		editingCableEnd = { ...cableEnd };
	}

	function cancelEdit() {
		editingCableEnd = null;
	}

	function getTypeColor(type: string) {
		const colors: { [key: string]: string } = {
			'BNC': '#FF6B6B',
			'XLR': '#4ECDC4',
			'RCA': '#45B7D1',
			'HDMI': '#96CEB4',
			'RJ45': '#FFEAA7',
			'USB-A': '#DDA0DD',
			'USB-B': '#98D8C8',
			'USB-C': '#F7DC6F',
			'Power': '#BB8FCE',
			'AC': '#85C1E9',
			'DC': '#F8C471'
		};
		return colors[type] || '#6B7280';
	}
</script>

<svelte:head>
	<title>Cable Ends - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
	<SectionHeader 
		title="Cable Ends" 
		description="Manage cable connectors and terminations"
	>
		<Button on:click={() => (showAddModal = true)}>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Cable End
		</Button>
	</SectionHeader>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
		</div>
	{:else if cableEnds.length === 0}
		<div class="text-center py-12">
			<div class="text-tertiary text-4xl mb-4">🔌</div>
			<h3 class="text-lg font-medium text-primary mb-2">No cable ends yet</h3>
			<p class="text-secondary mb-4">Create your first cable end to start managing connectors.</p>
			<Button on:click={() => (showAddModal = true)}>Add Cable End</Button>
		</div>
	{:else}
		<!-- Cable Ends Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each cableEnds as cableEnd}
				<Card>
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<h3 class="text-lg font-semibold mb-1 text-primary">{cableEnd.name}</h3>
							<div class="flex items-center gap-2">
								<div 
									class="w-3 h-3 rounded-full"
									style="background-color: {cableEnd.color}"
								></div>
								<span class="text-sm text-secondary">{cableEnd.type} - {cableEnd.gender}</span>
							</div>
						</div>
						<div class="flex items-center space-x-2">
							<Button
								variant="ghost"
								size="sm"
								className="text-accent hover:text-accent-secondary p-1"
								on:click={() => startEdit(cableEnd)}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</Button>
							<Button
								variant="danger"
								size="sm"
								className="p-1"
								on:click={() => deleteCableEnd(cableEnd.id)}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</Button>
						</div>
					</div>

					{#if cableEnd.description}
						<p class="text-sm text-secondary mb-4">{cableEnd.description}</p>
					{/if}

					<div class="flex items-center justify-between pt-4 border-t border-card">
						<div class="flex items-center text-sm text-secondary">
							<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Connector
						</div>
						<span class="text-xs text-tertiary">ID: {cableEnd.id}</span>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Cable End Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Add New Cable End</h2>
			<form on:submit|preventDefault={addCableEnd} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<Input id="name" bind:value={newCableEnd.name} placeholder="Enter cable end name" required />
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="type" class="block text-sm font-medium text-secondary mb-1">Type *</label>
						<Select 
							id="type" 
							bind:value={newCableEnd.type}
							options={connectorTypes.map(type => ({ value: type, label: type }))}
							placeholder="Select connector type"
							required
						/>
					</div>
					<div>
						<label for="gender" class="block text-sm font-medium text-secondary mb-1">Gender *</label>
						<Select 
							id="gender" 
							bind:value={newCableEnd.gender}
							options={genderOptions.map(gender => ({ value: gender, label: gender }))}
							placeholder="Select gender"
							required
						/>
					</div>
				</div>

				<div>
					<label for="color" class="block text-sm font-medium text-secondary mb-1">Color</label>
					<Input id="color" type="color" bind:value={newCableEnd.color} />
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-secondary mb-1">Description</label>
					<TextArea id="description" bind:value={newCableEnd.description} placeholder="Enter description" />
				</div>

				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Add Cable End</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={() => (showAddModal = false)}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Cable End Modal -->
{#if editingCableEnd}
	<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
		<div class="bg-card rounded-xl p-6 w-full max-w-md border border-card">
			<h2 class="text-xl font-bold text-primary mb-4">Edit Cable End</h2>
			<form on:submit|preventDefault={updateCableEnd} class="space-y-4">
				<div>
					<label for="edit-name" class="block text-sm font-medium text-secondary mb-1">Name *</label>
					<Input id="edit-name" bind:value={editingCableEnd.name} placeholder="Enter cable end name" required />
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-type" class="block text-sm font-medium text-secondary mb-1">Type *</label>
						<Select 
							id="edit-type" 
							bind:value={editingCableEnd.type}
							options={connectorTypes.map(type => ({ value: type, label: type }))}
							placeholder="Select connector type"
							required
						/>
					</div>
					<div>
						<label for="edit-gender" class="block text-sm font-medium text-secondary mb-1">Gender *</label>
						<Select 
							id="edit-gender" 
							bind:value={editingCableEnd.gender}
							options={genderOptions.map(gender => ({ value: gender, label: gender }))}
							placeholder="Select gender"
							required
						/>
					</div>
				</div>

				<div>
					<label for="edit-color" class="block text-sm font-medium text-secondary mb-1">Color</label>
					<Input id="edit-color" type="color" bind:value={editingCableEnd.color} />
				</div>

				<div>
					<label for="edit-description" class="block text-sm font-medium text-secondary mb-1">Description</label>
					<TextArea id="edit-description" bind:value={editingCableEnd.description} placeholder="Enter description" />
				</div>

				<div class="flex space-x-3 pt-4">
					<Button type="submit" className="flex-1">Update Cable End</Button>
					<Button variant="secondary" type="button" className="flex-1" on:click={cancelEdit}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if} 