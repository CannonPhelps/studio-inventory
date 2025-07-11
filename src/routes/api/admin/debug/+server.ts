import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/routeProtection';
import { BackupService } from '$lib/server/backup';

export const GET: RequestHandler = async (event) => {
  await requireAdmin(event);

  const snapshot = await BackupService.createSnapshot();

  return json(snapshot);
}; 