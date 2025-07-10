<script lang="ts">
  import { onMount } from 'svelte';
  import type { EmailTemplate } from '$lib/server/communication';

  let templates: EmailTemplate[] = [];
  let loading = true;
  let error = '';
  let testEmail = '';
  let testPhone = '';
  let testResult = '';
  let selectedTemplate = '';
  let templateVariables: Record<string, string> = {};
  let renderedTemplate: { subject: string; body: string } | null = null;

  onMount(async () => {
    await loadTemplates();
  });

  async function loadTemplates() {
    try {
      loading = true;
      const response = await fetch('/api/admin/communications?action=templates');
      if (!response.ok) throw new Error('Failed to load templates');
      
      templates = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load templates';
    } finally {
      loading = false;
    }
  }

  async function testEmailSending() {
    if (!testEmail) {
      testResult = 'Please enter an email address';
      return;
    }

    try {
      const response = await fetch(`/api/admin/communications?action=test-email&email=${encodeURIComponent(testEmail)}`);
      const result = await response.json();
      
      if (result.success) {
        testResult = 'Test email sent successfully!';
      } else {
        testResult = 'Failed to send test email';
      }
    } catch (err) {
      testResult = 'Error sending test email';
    }
  }

  async function testSMSSending() {
    if (!testPhone) {
      testResult = 'Please enter a phone number';
      return;
    }

    try {
      const response = await fetch(`/api/admin/communications?action=test-sms&phone=${encodeURIComponent(testPhone)}`);
      const result = await response.json();
      
      if (result.success) {
        testResult = 'Test SMS sent successfully!';
      } else {
        testResult = 'Failed to send test SMS';
      }
    } catch (err) {
      testResult = 'Error sending test SMS';
    }
  }

  async function renderTemplate() {
    if (!selectedTemplate) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Initialize variables with sample data
    templateVariables = {};
    template.variables.forEach(variable => {
      templateVariables[variable] = `Sample ${variable}`;
    });

    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'render-template',
          data: { templateId: selectedTemplate, variables: templateVariables }
        })
      });

      if (response.ok) {
        renderedTemplate = await response.json();
      }
    } catch (err) {
      console.error('Failed to render template:', err);
    }
  }

  $: if (selectedTemplate) {
    renderTemplate();
  }
</script>

<svelte:head>
  <title>Communications - Studio Inventory</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Communications</h1>
      <p class="text-gray-600 mt-2">Manage email and SMS notifications</p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{error}</p>
        <button 
          on:click={loadTemplates}
          class="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Test Communications -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Communications</h3>
          
          <!-- Email Test -->
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-700 mb-3">Test Email</h4>
            <div class="flex space-x-2">
              <input
                type="email"
                bind:value={testEmail}
                placeholder="Enter email address"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                on:click={testEmailSending}
                class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send Test
              </button>
            </div>
          </div>

          <!-- SMS Test -->
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-700 mb-3">Test SMS</h4>
            <div class="flex space-x-2">
              <input
                type="tel"
                bind:value={testPhone}
                placeholder="Enter phone number"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                on:click={testSMSSending}
                class="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Send Test
              </button>
            </div>
          </div>

          {#if testResult}
            <div class="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
              <p class="text-blue-800 text-sm">{testResult}</p>
            </div>
          {/if}
        </div>

        <!-- Email Templates -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
          
          <div class="mb-4">
            <label for="template" class="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
            <select
              id="template"
              bind:value={selectedTemplate}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a template...</option>
              {#each templates as template}
                <option value={template.id}>{template.name}</option>
              {/each}
            </select>
          </div>

          {#if selectedTemplate && renderedTemplate}
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div class="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {renderedTemplate.subject}
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <div class="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm whitespace-pre-wrap">
                  {renderedTemplate.body}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Configuration -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email Configuration -->
          <div>
            <h4 class="text-md font-medium text-gray-700 mb-3">Email Settings</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-600">Provider</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>SMTP</option>
                  <option>SendGrid</option>
                  <option>Mailgun</option>
                  <option>AWS SES</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">SMTP Host</label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">SMTP Port</label>
                <input
                  type="number"
                  placeholder="587"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">Username</label>
                <input
                  type="email"
                  placeholder="your-email@gmail.com"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">Password</label>
                <input
                  type="password"
                  placeholder="App password"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- SMS Configuration -->
          <div>
            <h4 class="text-md font-medium text-gray-700 mb-3">SMS Settings</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-600">Provider</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Twilio</option>
                  <option>AWS SNS</option>
                  <option>Nexmo</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">Account SID</label>
                <input
                  type="text"
                  placeholder="AC..."
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">Auth Token</label>
                <input
                  type="password"
                  placeholder="Auth token"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">From Number</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Save Configuration
          </button>
        </div>
      </div>

      <!-- Notification Types -->
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="overdue" class="mr-2" checked />
              <label for="overdue" class="font-medium text-gray-700">Overdue Reminders</label>
            </div>
            <p class="text-sm text-gray-600">Send reminders for overdue items</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" /> SMS
              </label>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="low-stock" class="mr-2" checked />
              <label for="low-stock" class="font-medium text-gray-700">Low Stock Alerts</label>
            </div>
            <p class="text-sm text-gray-600">Notify when items are running low</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" /> SMS
              </label>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="maintenance" class="mr-2" checked />
              <label for="maintenance" class="font-medium text-gray-700">Maintenance Reminders</label>
            </div>
            <p class="text-sm text-gray-600">Remind about scheduled maintenance</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" /> SMS
              </label>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="security" class="mr-2" checked />
              <label for="security" class="font-medium text-gray-700">Security Alerts</label>
            </div>
            <p class="text-sm text-gray-600">Alert on security events</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> SMS
              </label>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="welcome" class="mr-2" checked />
              <label for="welcome" class="font-medium text-gray-700">Welcome Messages</label>
            </div>
            <p class="text-sm text-gray-600">Send welcome emails to new users</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" /> SMS
              </label>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <input type="checkbox" id="system" class="mr-2" checked />
              <label for="system" class="font-medium text-gray-700">System Notifications</label>
            </div>
            <p class="text-sm text-gray-600">General system announcements</p>
            <div class="mt-2 space-y-1">
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" checked /> Email
              </label>
              <label class="flex items-center text-xs">
                <input type="checkbox" class="mr-1" /> SMS
              </label>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div> 