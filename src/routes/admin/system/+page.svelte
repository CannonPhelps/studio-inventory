<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';
  import SectionHeader from '$lib/components/SectionHeader.svelte';

  // Tab management
  let activeTab = 'settings';
  const tabs = [
    { id: 'settings', name: 'Settings', icon: '⚙️', description: 'System configuration and preferences' },
    { id: 'users', name: 'Users', icon: '👥', description: 'Manage user accounts and permissions' },
    { id: 'audit-logs', name: 'Audit Logs', icon: '📋', description: 'System activity and security logs' },
    { id: 'backups', name: 'Backups', icon: '💾', description: 'Data backup and recovery' },
    { id: 'import', name: 'Import', icon: '📥', description: 'Data import and migration tools' },
    { id: 'communications', name: 'Communications', icon: '📧', description: 'System notifications and messaging' },
    { id: 'automated-tasks', name: 'Automated Tasks', icon: '⏰', description: 'Scheduled tasks and automation' }
  ];

  // Shared data
  let loading = true;
  let error = '';
  let errors = {
    settings: '',
    users: '',
    auditLogs: '',
    backups: '',
    import: '',
    communications: '',
    automatedTasks: ''
  };

  // Settings data
  let settings: any = {};
  let showSettingsModal = false;

  // Audit logs data
  let auditLogs: any[] = [];
  let showAuditModal = false;

  // Backups data
  let backups: any[] = [];
  let showBackupModal = false;
  let newBackup = {
    name: '',
    description: '',
    type: 'full'
  };

  // Communications data
  let communications: any[] = [];
  let showCommunicationModal = false;
  let newCommunication = {
    type: 'email',
    subject: '',
    message: '',
    recipients: ''
  };

  // Users data
  let users: any[] = [];
  let showAddUserModal = false;
  let newUser = {
    name: '',
    email: '',
    role: 'user',
    department: ''
  };

  // Automated tasks data
  let automatedTasks: any[] = [];
  let showTaskModal = false;
  let newTask = {
    name: '',
    description: '',
    schedule: '',
    action: '',
    enabled: true
  };

  // Import data
  let importHistory: any[] = [];
  let showImportModal = false;
  let newImport = {
    type: 'csv',
    file: null as File | null,
    description: '',
    options: {
      skipHeader: true,
      updateExisting: false,
      validateData: true
    }
  };

  const backupTypes = ['full', 'incremental', 'differential'];
  const communicationTypes = ['email', 'sms', 'notification'];
  const taskActions = ['backup', 'maintenance', 'cleanup', 'report', 'notification'];
  const importTypes = ['csv', 'json', 'excel'];

  onMount(async () => {
    await loadAllData();
  });

  async function loadAllData() {
    loading = true;
    error = '';
    // Reset individual errors
    errors = {
      settings: '',
      users: '',
      auditLogs: '',
      backups: '',
      import: '',
      communications: '',
      automatedTasks: ''
    };
    
    try {
      const [settingsRes, usersRes, auditRes, backupsRes, importRes, communicationsRes, tasksRes] = await Promise.allSettled([
        fetch('/api/admin/settings'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/backups'),
        fetch('/api/admin/import'),
        fetch('/api/admin/communications'),
        fetch('/api/admin/automated-tasks')
      ]);

      // Handle settings
      if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
        settings = await settingsRes.value.json();
      } else {
        errors.settings = 'Failed to load settings';
        settings = {};
      }

      // Handle users
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        users = await usersRes.value.json();
      } else {
        errors.users = 'Failed to load users';
        users = [];
      }

      // Handle audit logs
      if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const auditData = await auditRes.value.json();
        console.log('Audit data:', auditData);
        auditLogs = auditData.logs || auditData || [];
        console.log('Audit logs:', auditLogs);
      } else {
        errors.auditLogs = 'Failed to load audit logs';
        auditLogs = [];
      }

      // Handle backups
      if (backupsRes.status === 'fulfilled' && backupsRes.value.ok) {
        const backupData = await backupsRes.value.json();
        console.log('Backup data:', backupData);
        backups = backupData.backups || backupData || [];
        console.log('Backups:', backups);
      } else {
        errors.backups = 'Failed to load backups';
        backups = [];
      }

      // Handle import history
      if (importRes.status === 'fulfilled' && importRes.value.ok) {
        const importData = await importRes.value.json();
        importHistory = importData.history || importData || [];
      } else {
        errors.import = 'Failed to load import history';
        importHistory = [];
      }

      // Handle communications
      if (communicationsRes.status === 'fulfilled' && communicationsRes.value.ok) {
        communications = await communicationsRes.value.json();
      } else {
        errors.communications = 'Failed to load communications';
        communications = [];
      }

      // Handle automated tasks
      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        automatedTasks = await tasksRes.value.json();
      } else {
        errors.automatedTasks = 'Failed to load automated tasks';
        automatedTasks = [];
      }

    } catch (e) {
      console.error('Error loading data:', e);
      error = e instanceof Error ? e.message : 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  // Settings functions
  function openSettingsModal() {
    showSettingsModal = true;
  }

  async function saveSettings() {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      showSettingsModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error saving settings:', e);
      error = e instanceof Error ? e.message : 'Failed to save settings';
    }
  }

  // Backup functions
  function openBackupModal() {
    newBackup = {
      name: '',
      description: '',
      type: 'full'
    };
    showBackupModal = true;
  }

  async function createBackup() {
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBackup)
      });

      if (!response.ok) throw new Error('Failed to create backup');
      
      showBackupModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error creating backup:', e);
      error = e instanceof Error ? e.message : 'Failed to create backup';
    }
  }

  // Communication functions
  function openCommunicationModal() {
    newCommunication = {
      type: 'email',
      subject: '',
      message: '',
      recipients: ''
    };
    showCommunicationModal = true;
  }

  async function sendCommunication() {
    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommunication)
      });

      if (!response.ok) throw new Error('Failed to send communication');
      
      showCommunicationModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error sending communication:', e);
      error = e instanceof Error ? e.message : 'Failed to send communication';
    }
  }

  // User functions
  function openAddUserModal() {
    newUser = {
      name: '',
      email: '',
      role: 'user',
      department: ''
    };
    showAddUserModal = true;
  }

  async function saveUser() {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) throw new Error('Failed to create user');
      
      showAddUserModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error creating user:', e);
      error = e instanceof Error ? e.message : 'Failed to create user';
    }
  }

  // Task functions
  function openTaskModal() {
    newTask = {
      name: '',
      description: '',
      schedule: '',
      action: '',
      enabled: true
    };
    showTaskModal = true;
  }

  async function createTask() {
    try {
      const response = await fetch('/api/admin/automated-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      showTaskModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error creating task:', e);
      error = e instanceof Error ? e.message : 'Failed to create task';
    }
  }

  // Import functions
  function openImportModal() {
    newImport = {
      type: 'csv',
      file: null,
      description: '',
      options: {
        skipHeader: true,
        updateExisting: false,
        validateData: true
      }
    };
    showImportModal = true;
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      newImport.file = target.files[0];
    }
  }

  async function executeImport() {
    if (!newImport.file) {
      error = 'Please select a file to import';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', newImport.file);
      formData.append('type', newImport.type);
      formData.append('description', newImport.description);
      formData.append('options', JSON.stringify(newImport.options));

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to execute import');
      
      showImportModal = false;
      await loadAllData();
    } catch (e) {
      console.error('Error executing import:', e);
      error = e instanceof Error ? e.message : 'Failed to execute import';
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  function formatDateTime(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }
</script>

<svelte:head>
  <title>System Management - Studio Inventory</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">System Management</h1>
        <p class="text-white/80 mt-2 text-lg">Configure system settings and monitor operations</p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold">{auditLogs.length + backups.length + communications.length + automatedTasks.length}</div>
        <div class="text-white/80 text-sm">Total Records</div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <Card>
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.id}
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === tab.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          >
            <div class="flex items-center space-x-2">
              <span class="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </div>
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      {:else}
        <!-- Settings Tab -->
        {#if activeTab === 'settings'}
          <div class="space-y-6">
            {#if errors.settings}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.settings}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">System Settings</h2>
                <p class="text-secondary">Configure system preferences and behavior</p>
              </div>
              <button
                on:click={openSettingsModal}
                class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Settings
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">General Settings</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>System Name:</span>
                    <span class="font-medium">{settings.systemName || 'Studio Inventory'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Time Zone:</span>
                    <span class="font-medium">{settings.timezone || 'UTC'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Language:</span>
                    <span class="font-medium">{settings.language || 'English'}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-lg mb-3">Security Settings</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>Session Timeout:</span>
                    <span class="font-medium">{settings.sessionTimeout || '8 hours'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Password Policy:</span>
                    <span class="font-medium">{settings.passwordPolicy || 'Standard'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>2FA Required:</span>
                    <span class="font-medium">{settings.twoFactorRequired ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <!-- Users Tab -->
        {:else if activeTab === 'users'}
          <div class="space-y-6">
            {#if errors.users}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.users}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Users ({users.length})</h2>
                <p class="text-secondary">Manage user accounts and permissions</p>
              </div>
              <button
                on:click={openAddUserModal}
                class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add User
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each users as user}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{user.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                      {user.role}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>Email:</span>
                      <span class="font-medium">{user.email}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Department:</span>
                      <span class="font-medium">{user.department || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Status:</span>
                      <span class="font-medium">{user.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Audit Logs Tab -->
        {:else if activeTab === 'audit-logs'}
          <div class="space-y-6">
            {#if errors.auditLogs}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.auditLogs}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Audit Logs ({auditLogs.length})</h2>
                <p class="text-secondary">System activity and security monitoring</p>
              </div>
            </div>

            {#if auditLogs.length > 0}
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {#each auditLogs.slice(0, 20) as log}
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(log.timestamp)}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.userId || 'System'}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.action}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.entityType} {log.entityId ? `(${log.entityId})` : ''}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(log.severity || 'INFO')}">
                              {log.severity || 'INFO'}
                            </span>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {:else}
              <div class="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div class="text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
                  <p class="mt-1 text-sm text-gray-500">No audit logs have been recorded yet.</p>
                </div>
              </div>
            {/if}
          </div>

        <!-- Backups Tab -->
        {:else if activeTab === 'backups'}
          <div class="space-y-6">
            {#if errors.backups}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.backups}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Backups ({backups.length})</h2>
                <p class="text-secondary">Data backup and recovery management</p>
              </div>
              <button
                on:click={openBackupModal}
                class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create Backup
              </button>
            </div>

            {#if backups.length > 0}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each backups as backup}
                  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-semibold text-lg">Backup {backup.id.slice(0, 8)}</h3>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600">
                      <p>{backup.description || 'Full database backup'}</p>
                      <div class="flex justify-between">
                        <span>Version:</span>
                        <span class="font-medium">{backup.version}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Size:</span>
                        <span class="font-medium">{(backup.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Records:</span>
                        <span class="font-medium">{backup.recordCount}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Created:</span>
                        <span class="font-medium">{formatDate(backup.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div class="text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No backups</h3>
                  <p class="mt-1 text-sm text-gray-500">No backups have been created yet.</p>
                </div>
              </div>
            {/if}
          </div>

        <!-- Communications Tab -->
        {:else if activeTab === 'communications'}
          <div class="space-y-6">
            {#if errors.communications}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.communications}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Communications ({communications.length})</h2>
                <p class="text-secondary">System notifications and messaging</p>
              </div>
              <button
                on:click={openCommunicationModal}
                class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Send Message
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each communications as comm}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{comm.subject}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(comm.status)}">
                      {comm.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>Type:</span>
                      <span class="font-medium capitalize">{comm.type}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Recipients:</span>
                      <span class="font-medium">{comm.recipients}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Sent:</span>
                      <span class="font-medium">{formatDate(comm.sentAt)}</span>
                    </div>
                    <p class="text-sm">{comm.message}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Automated Tasks Tab -->
        {:else if activeTab === 'automated-tasks'}
          <div class="space-y-6">
            {#if errors.automatedTasks}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.automatedTasks}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Automated Tasks ({automatedTasks.length})</h2>
                <p class="text-secondary">Scheduled tasks and automation</p>
              </div>
              <button
                on:click={openTaskModal}
                class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create Task
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each automatedTasks as task}
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg">{task.name}</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {task.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                      {task.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600">
                    <p>{task.description}</p>
                    <div class="flex justify-between">
                      <span>Action:</span>
                      <span class="font-medium capitalize">{task.action}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Schedule:</span>
                      <span class="font-medium">{task.schedule}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Last Run:</span>
                      <span class="font-medium">{formatDate(task.lastRun)}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        <!-- Import Tab -->
        {:else if activeTab === 'import'}
          <div class="space-y-6">
            {#if errors.import}
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">{errors.import}</p>
                <button 
                  on:click={loadAllData}
                  class="mt-2 text-red-800 hover:text-red-600 underline transition-colors"
                >
                  Try again
                </button>
              </div>
            {/if}
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-semibold text-primary">Data Import ({importHistory.length})</h2>
                <p class="text-secondary">Import data from external sources</p>
              </div>
              <button
                on:click={openImportModal}
                class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Import Data
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each importHistory as importRecord}
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{importRecord.type.toUpperCase()} Import</h3>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(importRecord.status)}">
                      {importRecord.status}
                    </span>
                  </div>
                  <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>{importRecord.description}</p>
                    <div class="flex justify-between">
                      <span>Records:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{importRecord.recordsProcessed || 0}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Date:</span>
                      <span class="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(importRecord.createdAt)}</span>
                    </div>
                    {#if importRecord.error}
                      <div class="text-red-600 dark:text-red-400 text-xs">
                        Error: {importRecord.error}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </Card>
</div>

<!-- Add User Modal -->
{#if showAddUserModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New User</h3>
        <button 
          on:click={() => showAddUserModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input 
            type="text" 
            bind:value={newUser.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input 
            type="email" 
            bind:value={newUser.email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            bind:value={newUser.role}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input 
            type="text" 
            bind:value={newUser.department}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter department"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showAddUserModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveUser}
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
        >
          Add User
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Settings Modal -->
{#if showSettingsModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">System Settings</h3>
        <button 
          on:click={() => showSettingsModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">System Name</label>
          <input 
            type="text" 
            bind:value={settings.systemName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
          <select 
            bind:value={settings.timezone}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select 
            bind:value={settings.language}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Session Timeout</label>
          <select 
            bind:value={settings.sessionTimeout}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="1 hour">1 hour</option>
            <option value="4 hours">4 hours</option>
            <option value="8 hours">8 hours</option>
            <option value="24 hours">24 hours</option>
          </select>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="two-factor" 
            bind:checked={settings.twoFactorRequired}
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          >
          <label for="two-factor" class="text-sm font-medium text-gray-700">Require Two-Factor Authentication</label>
        </div>

        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="notifications" 
            bind:checked={settings.enableNotifications}
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          >
          <label for="notifications" class="text-sm font-medium text-gray-700">Enable System Notifications</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showSettingsModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={saveSettings}
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Create Backup Modal -->
{#if showBackupModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create Backup</h3>
        <button 
          on:click={() => showBackupModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Backup Name</label>
          <input 
            type="text" 
            bind:value={newBackup.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter backup name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newBackup.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Backup description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
          <select 
            bind:value={newBackup.type}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {#each backupTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showBackupModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={createBackup}
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
        >
          Create Backup
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Send Communication Modal -->
{#if showCommunicationModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Send Communication</h3>
        <button 
          on:click={() => showCommunicationModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select 
            bind:value={newCommunication.type}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {#each communicationTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            bind:value={newCommunication.subject}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Message subject"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
          <input 
            type="text" 
            bind:value={newCommunication.recipients}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Email addresses or user IDs"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            bind:value={newCommunication.message}
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Message content"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showCommunicationModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={sendCommunication}
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
        >
          Send Message
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Create Task Modal -->
{#if showTaskModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Create Automated Task</h3>
        <button 
          on:click={() => showTaskModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
          <input 
            type="text" 
            bind:value={newTask.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter task name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newTask.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Task description"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select 
            bind:value={newTask.action}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select action</option>
            {#each taskActions as action}
              <option value={action}>{action}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Schedule (Cron Expression)</label>
          <input 
            type="text" 
            bind:value={newTask.schedule}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0 0 * * * (daily at midnight)"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="task-enabled" 
            bind:checked={newTask.enabled}
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          >
          <label for="task-enabled" class="text-sm font-medium text-gray-700">Enable Task</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showTaskModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={createTask}
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-150"
        >
          Create Task
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Import Data Modal -->
{#if showImportModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Import Data</h3>
        <button 
          on:click={() => showImportModal = false}
          class="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Import Type</label>
          <select 
            bind:value={newImport.type}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {#each importTypes as type}
              <option value={type}>{type.toUpperCase()}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">File</label>
          <input 
            type="file" 
            accept=".csv,.json,.xlsx,.xls"
            on:change={handleFileSelect}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            bind:value={newImport.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Import description"
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Import Options</label>
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="skip-header" 
              bind:checked={newImport.options.skipHeader}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            >
            <label for="skip-header" class="text-sm text-gray-700">Skip Header Row</label>
          </div>
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="update-existing" 
              bind:checked={newImport.options.updateExisting}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            >
            <label for="update-existing" class="text-sm text-gray-700">Update Existing Records</label>
          </div>
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="validate-data" 
              bind:checked={newImport.options.validateData}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            >
            <label for="validate-data" class="text-sm text-gray-700">Validate Data</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          on:click={() => showImportModal = false}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
        >
          Cancel
        </button>
        <button 
          on:click={executeImport}
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-150"
        >
          Import Data
        </button>
      </div>
    </div>
  </div>
{/if}