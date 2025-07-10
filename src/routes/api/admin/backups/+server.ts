import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { BackupService } from '$lib/server/backup';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    
    const backups = await BackupService.listBackups();
    const stats = await BackupService.getBackupStats();
    
    return json({ backups, stats });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    
    const { description } = await event.request.json();
    const backup = await BackupService.createBackup(description);
    
    return json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    return json({ error: 'Failed to create backup' }, { status: 500 });
  }
}; 