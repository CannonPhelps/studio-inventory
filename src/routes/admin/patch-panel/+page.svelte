<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  // ATEM HD8 Specifications
  const atemSpecs = {
    name: 'Blackmagic Design ATEM Television Studio HD8',
    inputs: [
      { id: 1, name: 'Input 1', type: 'HDMI', status: 'connected', source: 'Camera 1', color: 'bg-blue-500' },
      { id: 2, name: 'Input 2', type: 'HDMI', status: 'connected', source: 'Camera 2', color: 'bg-blue-500' },
      { id: 3, name: 'Input 3', type: 'HDMI', status: 'connected', source: 'Camera 3', color: 'bg-blue-500' },
      { id: 4, name: 'Input 4', type: 'HDMI', status: 'connected', source: 'Camera 4', color: 'bg-blue-500' },
      { id: 5, name: 'Input 5', type: 'HDMI', status: 'connected', source: 'Graphics PC', color: 'bg-blue-500' },
      { id: 6, name: 'Input 6', type: 'HDMI', status: 'connected', source: 'Playback Device', color: 'bg-blue-500' },
      { id: 7, name: 'Input 7', type: 'HDMI', status: 'disconnected', source: '', color: 'bg-gray-400' },
      { id: 8, name: 'Input 8', type: 'HDMI', status: 'disconnected', source: '', color: 'bg-gray-400' },
      { id: 'AUX', name: 'AUX Input', type: 'HDMI', status: 'connected', source: 'Laptop', color: 'bg-green-500' },
      { id: 'MP1', name: 'Media Player 1', type: 'Internal', status: 'connected', source: 'Logo', color: 'bg-purple-500' },
      { id: 'MP2', name: 'Media Player 2', type: 'Internal', status: 'connected', source: 'Lower Third', color: 'bg-purple-500' }
    ],
    outputs: [
      { id: 'PGM', name: 'Program Output', type: 'HDMI', status: 'active', destination: 'Main Display', color: 'bg-red-500' },
      { id: 'PVW', name: 'Preview Output', type: 'HDMI', status: 'active', destination: 'Preview Monitor', color: 'bg-yellow-500' },
      { id: 'AUX1', name: 'AUX Output 1', type: 'HDMI', status: 'active', destination: 'Streaming PC', color: 'bg-green-500' },
      { id: 'AUX2', name: 'AUX Output 2', type: 'HDMI', status: 'active', destination: 'Recording Device', color: 'bg-green-500' },
      { id: 'MULTI', name: 'Multi-View', type: 'HDMI', status: 'active', destination: 'Multi-View Monitor', color: 'bg-indigo-500' }
    ],
    features: [
      '8 x HDMI Inputs',
      '1 x HDMI Program Output',
      '1 x HDMI Preview Output',
      '2 x HDMI AUX Outputs',
      '1 x HDMI Multi-View Output',
      '2 x Internal Media Players',
      'Up/Down/Cross Converter',
      'Professional Audio Mixer',
      'Built-in Streaming',
      'USB Recording'
    ]
  };

  let selectedInput = writable<any>(null);
  let selectedOutput = writable<any>(null);
  let showConnectionModal = writable(false);
  let showSettingsModal = writable(false);
  let connectionForm = writable({
    source: '',
    destination: '',
    cableType: 'HDMI',
    notes: ''
  });

  function selectInput(input: any) {
    selectedInput.set(input);
    showConnectionModal.set(true);
  }

  function selectOutput(output: any) {
    selectedOutput.set(output);
    showSettingsModal.set(true);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'connected':
      case 'active':
        return '✓';
      case 'disconnected':
        return '○';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  }

  function formatCableType(type: string) {
    return type.replace('HDMI', 'HDMI').replace('SDI', 'SDI').replace('Internal', 'Internal');
  }
</script>

<svelte:head>
  <title>ATEM HD8 Patch Panel - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Virtual Patch Panel</h1>
        <p class="text-white/80 mt-2 text-lg">{atemSpecs.name}</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold">{atemSpecs.inputs.filter(i => i.status === 'connected').length}</div>
        <div class="text-white/80 text-sm">Active Inputs</div>
      </div>
    </div>
  </div>

  <!-- System Overview -->
  <Card>
    <SectionHeader title="System Overview" subtitle="ATEM HD8 specifications and features">
      <button 
        on:click={() => showSettingsModal.set(true)}
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        System Settings
      </button>
    </SectionHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each atemSpecs.features as feature}
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-700">{feature}</span>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Inputs Section -->
  <Card>
    <SectionHeader title="Input Connections" subtitle="Manage input sources and connections">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">
          {atemSpecs.inputs.filter(i => i.status === 'connected').length} of {atemSpecs.inputs.length} connected
        </span>
      </div>
    </SectionHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each atemSpecs.inputs as input}
        <div 
          class="relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 {getStatusColor(input.status)}"
          on:click={() => selectInput(input)}
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full {input.color}"></div>
              <h3 class="font-semibold text-lg">{input.name}</h3>
            </div>
            <div class="text-2xl font-bold">{getStatusIcon(input.status)}</div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Type:</span>
              <span class="font-medium">{formatCableType(input.type)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium capitalize">{input.status}</span>
            </div>
            {#if input.source}
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Source:</span>
                <span class="font-medium truncate ml-2">{input.source}</span>
              </div>
            {/if}
          </div>

          {#if input.status === 'connected'}
            <div class="absolute top-2 right-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </Card>

  <!-- Outputs Section -->
  <Card>
    <SectionHeader title="Output Connections" subtitle="Monitor output destinations and status">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">
          {atemSpecs.outputs.filter(o => o.status === 'active').length} of {atemSpecs.outputs.length} active
        </span>
      </div>
    </SectionHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each atemSpecs.outputs as output}
        <div 
          class="relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 {getStatusColor(output.status)}"
          on:click={() => selectOutput(output)}
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full {output.color}"></div>
              <h3 class="font-semibold text-lg">{output.name}</h3>
            </div>
            <div class="text-2xl font-bold">{getStatusIcon(output.status)}</div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Type:</span>
              <span class="font-medium">{formatCableType(output.type)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium capitalize">{output.status}</span>
            </div>
            {#if output.destination}
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Destination:</span>
                <span class="font-medium truncate ml-2">{output.destination}</span>
              </div>
            {/if}
          </div>

          {#if output.status === 'active'}
            <div class="absolute top-2 right-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </Card>

  <!-- Signal Flow Diagram -->
  <Card>
    <SectionHeader title="Signal Flow" subtitle="Visual representation of signal routing">
    </SectionHeader>
    
    <div class="relative p-6 bg-gray-50 rounded-lg overflow-x-auto">
      <div class="flex items-center justify-center space-x-8 min-w-max">
        <!-- Inputs -->
        <div class="flex flex-col space-y-4">
          <h4 class="text-center font-semibold text-gray-700 mb-2">Inputs</h4>
          {#each atemSpecs.inputs.slice(0, 4) as input}
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 rounded-full {input.color}"></div>
              <span class="text-sm font-medium">{input.name}</span>
            </div>
          {/each}
        </div>

        <!-- ATEM Unit -->
        <div class="flex flex-col items-center">
          <div class="w-32 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm text-center">
            ATEM<br/>HD8
          </div>
          <div class="mt-2 text-xs text-gray-500 text-center">Video Switcher</div>
        </div>

        <!-- Outputs -->
        <div class="flex flex-col space-y-4">
          <h4 class="text-center font-semibold text-gray-700 mb-2">Outputs</h4>
          {#each atemSpecs.outputs.slice(0, 3) as output}
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium">{output.name}</span>
              <div class="w-4 h-4 rounded-full {output.color}"></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </Card>
</div>

<!-- Connection Modal -->
{#if $showConnectionModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Configure Input: {$selectedInput?.name}</h3>
        <button 
          on:click={() => showConnectionModal.set(false)}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Source Device</label>
          <input 
            type="text" 
            bind:value={$connectionForm.source}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Camera 1, Graphics PC"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cable Type</label>
          <select 
            bind:value={$connectionForm.cableType}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HDMI">HDMI</option>
            <option value="SDI">SDI</option>
            <option value="USB">USB</option>
            <option value="Ethernet">Ethernet</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            bind:value={$connectionForm.notes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this connection..."
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showConnectionModal.set(false)}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={() => {
            // Update the input source
            if ($selectedInput) {
              $selectedInput.source = $connectionForm.source;
              $selectedInput.status = $connectionForm.source ? 'connected' : 'disconnected';
            }
            showConnectionModal.set(false);
          }}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Connection
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Settings Modal -->
{#if $showSettingsModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">ATEM HD8 System Settings</h3>
        <button 
          on:click={() => showSettingsModal.set(false)}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Video Format</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="1080p50">1080p50</option>
              <option value="1080p60">1080p60</option>
              <option value="720p50">720p50</option>
              <option value="720p60">720p60</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Audio Sample Rate</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="48kHz">48kHz</option>
              <option value="44.1kHz">44.1kHz</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Multi-View Layout</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="8-input">8 Input Layout</option>
            <option value="4-input">4 Input Layout</option>
            <option value="2-input">2 Input Layout</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <input type="checkbox" id="streaming" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
          <label for="streaming" class="text-sm font-medium text-gray-700">Enable Built-in Streaming</label>
        </div>

        <div class="flex items-center space-x-2">
          <input type="checkbox" id="recording" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
          <label for="recording" class="text-sm font-medium text-gray-700">Enable USB Recording</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showSettingsModal.set(false)}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={() => showSettingsModal.set(false)}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
{/if} 