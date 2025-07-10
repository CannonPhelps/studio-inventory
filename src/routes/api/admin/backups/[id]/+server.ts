import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { BackupService } from '$lib/server/backup';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    
    const backupId = event.params.id;
    const { action, options = {} } = await event.request.json();
    
    if (action === 'restore') {
      const result = await BackupService.restoreBackup(backupId, options);
      return json(result);
    } else if (action === 'delete') {
      const success = await BackupService.deleteBackup(backupId);
      if (success) {
        return json({ success: true, message: 'Backup deleted successfully' });
      } else {
        return json({ success: false, message: 'Failed to delete backup' }, { status: 500 });
      }
    } else {
      return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error with backup operation:', error);
    return json({ error: 'Failed to perform backup operation' }, { status: 500 });
  }
}; 