import { requireAdmin } from '$lib/server/routeProtection';
import type { RequestHandler } from './$types';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { EncryptionService } from '$lib/server/encryption';

// Directory where backups are stored (must match BackupService.backupDir)
const BACKUP_DIR = './backups';

export const GET: RequestHandler = async (event) => {
  await requireAdmin(event);

  const backupId = event.params.id;
  const plain = event.url.searchParams.get('plain') === 'true';

  // Locate backup file (exclude metadata files)
  const files = await readdir(BACKUP_DIR);
  const backupFile = files.find((f) => f.includes(backupId) && !f.endsWith('-metadata.json'));

  if (!backupFile) {
    return new Response(JSON.stringify({ error: 'Backup not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const filePath = path.join(BACKUP_DIR, backupFile);
  const encrypted = await readFile(filePath, 'utf8');

  // If plain requested, decrypt and send JSON
  if (plain) {
    const password = process.env.BACKUP_ENCRYPTION_PASSWORD || 'default-backup-password';
    const json = EncryptionService.decrypt(encrypted, password);
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${backupFile.replace('.json', '')}-plain.json"`
      }
    });
  }

  // Otherwise return encrypted bytes
  return new Response(Buffer.from(encrypted, 'utf8'), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${backupFile}"`
    }
  });
}; 