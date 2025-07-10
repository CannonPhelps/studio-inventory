<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import AppLayout from '$lib/components/AppLayout.svelte';

	let { data } = $props<{ data: PageData }>();

	let checkouts = $state<any[]>([]);
	let activeCheckouts = $state<any[]>([]);
	let pastCheckouts = $state<any[]>([]);
	let selectedCheckout = $state<any>(null);
	let showReturnModal = $state(false);
	let returnForm = $state({
		condition: 'good',
		notes: ''
	});

	onMount(async () => {
		try {
			// Load all checkouts for current user
			const response = await fetch('/api/checkouts?user=current-user');
			if (response.ok) {
				checkouts = await response.json();
				activeCheckouts = checkouts.filter(c => c.status === 'Checked Out' || c.status === 'Overdue');
				pastCheckouts = checkouts.filter(c => c.status === 'Returned');
			}
		} catch (error) {
			console.error('Error loading checkouts:', error);
		}
	});

	function openReturnModal(checkout) {
		selectedCheckout = checkout;
		returnForm = {
			condition: 'good',
			notes: ''
		};
		showReturnModal = true;
	}

	async function handleReturn() {
		try {
			const response = await fetch('/api/checkouts', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					checkoutId: selectedCheckout.id,
					notes: returnForm.notes
				})
			});

			if (response.ok) {
				showReturnModal = false;
				// Refresh data
				await loadCheckouts();
			} else {
				const error = await response.json();
				alert(`Error: ${error.error}`);
			}
		} catch (error) {
			console.error('Error returning item:', error);
			alert('Failed to return item');
		}
	}

	async function loadCheckouts() {
		try {
			const response = await fetch('/api/checkouts?user=current-user');
			if (response.ok) {
				checkouts = await response.json();
				activeCheckouts = checkouts.filter(c => c.status === 'Checked Out' || c.status === 'Overdue');
				pastCheckouts = checkouts.filter(c => c.status === 'Returned');
			}
		} catch (error) {
			console.error('Error loading checkouts:', error);
		}
	}

	function getStatusColor(status) {
		switch (status) {
			case 'Checked Out': return 'text-primary bg-primary-100';
			case 'Overdue': return 'text-error bg-error-light';
			case 'Returned': return 'text-success bg-success-light';
			default: return 'text-secondary bg-secondary-100';
		}
	}

	function getStatusIcon(status) {
		switch (status) {
			case 'Checked Out': return '📤';
			case 'Overdue': return '⚠️';
			case 'Returned': return '✅';
			default: return '📋';
		}
	}

	function isOverdue(expectedReturn) {
		return new Date(expectedReturn) < new Date();
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getDaysRemaining(expectedReturn) {
		const today = new Date();
		const returnDate = new Date(expectedReturn);
		const diffTime = returnDate - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}
</script>

<svelte:head>
	<title>My Checkouts - Studio Inventory</title>
</svelte:head>

<AppLayout user={data.user}>
	<div class="space-y-6">
		<!-- Header -->
		<div class="bg-gradient-to-r from-accent to-accent-secondary rounded-2xl p-4 md:p-6 text-white">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
				<div>
					<h1 class="text-2xl md:text-3xl font-bold">My Checkouts</h1>
					<p class="text-white/80 mt-2">Manage your checked out equipment</p>
				</div>
				<div class="hidden md:flex items-center space-x-4">
					<div class="text-center">
						<div class="text-2xl font-bold">{activeCheckouts.length}</div>
						<div class="text-white/80 text-sm">Active Checkouts</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold">{pastCheckouts.length}</div>
						<div class="text-white/80 text-sm">Past Checkouts</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Active Checkouts -->
		{#if activeCheckouts.length > 0}
			<div class="bg-card rounded-xl shadow-custom border border-card">
				<div class="p-4 md:p-6 border-b border-card">
					<h2 class="text-lg md:text-xl font-semibold text-primary">Active Checkouts</h2>
					<p class="text-secondary mt-1">Items currently checked out to you</p>
				</div>
				<div class="p-4 md:p-6">
					<div class="space-y-4">
						{#each activeCheckouts as checkout}
							<div class="border border-card rounded-xl p-4 md:p-6 hover:shadow-custom transition-shadow bg-secondary">
								<div class="flex items-start justify-between">
									<div class="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
										<div class="w-10 h-10 md:w-12 md:h-12 bg-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
											<span class="text-xl md:text-2xl">{getStatusIcon(checkout.status)}</span>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-1 sm:space-y-0">
												<h3 class="text-base md:text-lg font-semibold text-primary truncate">{checkout.assetName}</h3>
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(checkout.status)} self-start sm:self-center">
													{checkout.status}
												</span>
											</div>
											
											<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
												<div>
													<span class="text-secondary text-xs md:text-sm">Serial Numbers:</span>
													<p class="font-mono text-primary text-xs md:text-sm truncate">{checkout.serialNumbers && checkout.serialNumbers.length > 0 ? checkout.serialNumbers.map(sn => sn.serialNumber).join(', ') : 'N/A'}</p>
												</div>
												<div>
													<span class="text-secondary text-xs md:text-sm">Location:</span>
													<p class="text-primary text-xs md:text-sm truncate">{checkout.location}</p>
												</div>
												<div>
													<span class="text-secondary text-xs md:text-sm">Checkout Date:</span>
													<p class="text-primary text-xs md:text-sm">{formatDate(checkout.checkoutDate)}</p>
												</div>
												<div>
													<span class="text-secondary text-xs md:text-sm">Expected Return:</span>
													<p class="text-primary text-xs md:text-sm {isOverdue(checkout.expectedReturn) ? 'text-error font-medium' : ''}">
														{formatDate(checkout.expectedReturn)}
														{#if isOverdue(checkout.expectedReturn)}
															<span class="text-xs text-error block">Overdue</span>
														{:else}
															<span class="text-xs text-secondary block">
																{getDaysRemaining(checkout.expectedReturn)} days remaining
															</span>
														{/if}
													</p>
												</div>
											</div>
											
											{#if checkout.notes}
												<div class="mt-3">
													<span class="text-secondary text-xs md:text-sm">Notes:</span>
													<p class="text-primary text-xs md:text-sm italic truncate">"{checkout.notes}"</p>
												</div>
											{/if}
										</div>
									</div>
									
									<div class="flex flex-col space-y-2 ml-4">
										<button
											on:click={() => openReturnModal(checkout)}
											class="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-secondary transition-colors"
										>
											Return Item
										</button>
										<a
											href="/checkout-panel"
											class="text-accent hover:text-accent-secondary text-sm font-medium text-center"
										>
											Check Out More
										</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<!-- Empty State -->
			<div class="bg-card rounded-xl shadow-custom border border-card p-8 text-center">
				<div class="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-primary mb-2">No Active Checkouts</h3>
				<p class="text-secondary mb-6">You haven't checked out any equipment yet.</p>
				<a
					href="/checkout-panel"
					class="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
				>
					Browse Equipment
				</a>
			</div>
		{/if}

		<!-- Past Checkouts -->
		{#if pastCheckouts.length > 0}
			<div class="bg-card rounded-xl shadow-custom border border-card">
				<div class="p-4 md:p-6 border-b border-card">
					<h2 class="text-lg md:text-xl font-semibold text-primary">Past Checkouts</h2>
					<p class="text-secondary mt-1">Previously returned items</p>
				</div>
				<div class="p-4 md:p-6">
					<div class="space-y-4">
						{#each pastCheckouts as checkout}
							<div class="border border-card rounded-lg p-4 hover:shadow-custom transition-shadow bg-secondary">
								<div class="flex items-center space-x-4">
									<div class="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
										<span class="text-xl">{getStatusIcon(checkout.status)}</span>
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-3 mb-1">
											<h3 class="font-semibold text-primary truncate">{checkout.assetName}</h3>
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(checkout.status)}">
												{checkout.status}
											</span>
										</div>
										<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
											<div>
												<span class="text-secondary text-xs">Checkout:</span>
												<p class="text-primary text-xs">{formatDate(checkout.checkoutDate)}</p>
											</div>
											<div>
												<span class="text-secondary text-xs">Return:</span>
												<p class="text-primary text-xs">{formatDate(checkout.returnDate)}</p>
											</div>
											<div>
												<span class="text-secondary text-xs">Duration:</span>
												<p class="text-primary text-xs">{getDaysRemaining(checkout.expectedReturn)} days</p>
											</div>
											<div>
												<span class="text-secondary text-xs">Condition:</span>
												<p class="text-primary text-xs capitalize">{checkout.returnCondition || 'Good'}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Return Modal -->
	{#if showReturnModal && selectedCheckout}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-card rounded-xl shadow-custom border border-card p-6 w-full max-w-md">
				<h3 class="text-lg font-semibold text-primary mb-4">Return Equipment</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Equipment</label>
						<div class="p-3 bg-secondary border border-card rounded-lg">
							<div class="font-medium text-primary">{selectedCheckout.assetName}</div>
							<div class="text-sm text-secondary">Serial: {selectedCheckout.serialNumbers && selectedCheckout.serialNumbers.length > 0 ? selectedCheckout.serialNumbers.map(sn => sn.serialNumber).join(', ') : 'N/A'}</div>
						</div>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Condition</label>
						<select
							bind:value={returnForm.condition}
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
						>
							<option value="good">Good</option>
							<option value="fair">Fair</option>
							<option value="poor">Poor</option>
							<option value="damaged">Damaged</option>
						</select>
					</div>
					
					<div>
						<label class="block text-sm font-medium text-secondary mb-2">Notes</label>
						<textarea
							bind:value={returnForm.notes}
							rows="3"
							class="w-full px-3 py-2 border border-input bg-input text-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
							placeholder="Optional notes..."
						></textarea>
					</div>
				</div>
				
				<div class="flex space-x-3 mt-6">
					<button
						on:click={() => showReturnModal = false}
						class="flex-1 px-4 py-2 border border-card bg-secondary text-primary rounded-lg hover:bg-tertiary transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={handleReturn}
						class="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
					>
						Return
					</button>
				</div>
			</div>
		</div>
	{/if}
</AppLayout> 