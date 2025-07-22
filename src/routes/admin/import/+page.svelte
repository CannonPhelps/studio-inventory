<script lang="ts">
  import { onMount } from 'svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';
  import Card from '$lib/components/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let selectedFile: File | null = null;
  let importType = 'assets';
  let isUploading = false;
  let uploadResult: any = null;
  let error = '';

  const importTypes = [
    { value: 'assets', label: 'Assets', description: 'Import equipment and inventory items' },
    { value: 'cableTypes', label: 'Cable Types', description: 'Import cable type definitions' },
    { value: 'bulkCables', label: 'Bulk Cables', description: 'Import bulk cable inventory' }
  ];

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFile = target.files[0];
      error = '';
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      error = 'Please select a file to upload';
      return;
    }

    isUploading = true;
    error = '';
    uploadResult = null;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('importType', importType);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        uploadResult = result;
      } else {
        error = result.error || 'Upload failed';
      }
    } catch (err) {
      error = 'Network error occurred';
      console.error('Upload error:', err);
    } finally {
      isUploading = false;
    }
  }

  function downloadTemplate() {
    const templates = {
      assets: '/static/templates/assets_template.csv',
      cableTypes: '/static/templates/cable_types_template.csv',
      bulkCables: '/static/templates/bulk_cables_template.csv'
    };

    const link = document.createElement('a');
    link.href = templates[importType as keyof typeof templates];
    link.download = `${importType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function resetForm() {
    selectedFile = null;
    importType = 'assets';
    uploadResult = null;
    error = '';
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
</script>

<svelte:head>
  <title>Import Data - Admin - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <SectionHeader 
    title="Import Data"
    subtitle="Upload CSV files to import assets, cable types, and bulk cables"
    gradient="from-accent to-accent-secondary">
  </SectionHeader>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Import Form -->
    <Card>
      <h3 class="text-lg font-semibold text-primary mb-4">Upload File</h3>
      
      <div class="space-y-4">
        <!-- Import Type Selection -->
        <div>
          <label for="importType" class="block text-sm font-medium text-primary mb-2">
            Import Type
          </label>
          <select
            id="importType"
            bind:value={importType}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {#each importTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
          <p class="text-sm text-secondary mt-1">
            {importTypes.find(t => t.value === importType)?.description}
          </p>
        </div>

        <!-- File Upload -->
        <div>
          <label for="fileInput" class="block text-sm font-medium text-primary mb-2">
            CSV File
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            on:change={handleFileSelect}
            class="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-secondary"
          />
          {#if selectedFile}
            <p class="text-sm text-secondary mt-1">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <Button 
            on:click={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : 'Upload & Import'}
          </Button>
          
          <Button 
            on:click={downloadTemplate}
            variant="outline"
            className="flex-shrink-0"
          >
            Download Template
          </Button>
        </div>

        <!-- Error Display -->
        {#if error}
          <div class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">❌ {error}</p>
          </div>
        {/if}
      </div>
    </Card>

    <!-- Instructions -->
    <Card>
      <h3 class="text-lg font-semibold text-primary mb-4">Import Instructions</h3>
      
      <div class="space-y-4 text-sm text-secondary">
        <div>
          <h4 class="font-medium text-primary mb-2">📋 Before Importing:</h4>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Download the template for your import type</li>
            <li>Fill in your data following the template format</li>
            <li>Save as CSV file</li>
            <li>Ensure all required fields are filled</li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-primary mb-2">📊 CSV Format Requirements:</h4>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>First row must contain column headers</li>
            <li>Use commas to separate values</li>
            <li>Text containing commas should be quoted</li>
            <li>Dates should be in YYYY-MM-DD format</li>
            <li>Prices should be numbers only (no currency symbols)</li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-primary mb-2">⚠️ Important Notes:</h4>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Categories will be created automatically if they don't exist</li>
            <li>Duplicate items will be skipped</li>
            <li>Serial numbers will be parsed and stored separately</li>
            <li>Large files may take several minutes to process</li>
          </ul>
        </div>
      </div>
    </Card>
  </div>

  <!-- Results Display -->
  {#if uploadResult}
    <Card>
      <h3 class="text-lg font-semibold text-primary mb-4">Import Results</h3>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div>
            <p class="font-medium text-green-800">
              ✅ Import completed successfully!
            </p>
            <p class="text-sm text-green-600">
              {uploadResult.imported} items imported
              {#if uploadResult.errors && uploadResult.errors.length > 0}
                • {uploadResult.errors.length} errors
              {/if}
            </p>
          </div>
          
          <Button 
            on:click={resetForm}
            variant="outline"
            size="sm"
          >
            Import Another File
          </Button>
        </div>

        {#if uploadResult.errors && uploadResult.errors.length > 0}
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 class="font-medium text-yellow-800 mb-2">
              ⚠️ Import Errors ({uploadResult.errors.length})
            </h4>
            <div class="max-h-40 overflow-y-auto">
              {#each uploadResult.errors as error}
                <p class="text-sm text-yellow-700 mb-1">• {error}</p>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </Card>
  {/if}
</div> 