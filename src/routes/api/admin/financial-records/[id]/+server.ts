import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/routeProtection';
import { FinanceService } from '$lib/server/finance';

export const PUT: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const id = Number(event.params.id);
    const data = await event.request.json();
    const record = await FinanceService.updateRecord(id, data);
    return json(record);
  } catch (error) {
    console.error('Finance PUT error:', error);
    return json({ error: 'Failed to update financial record' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const id = Number(event.params.id);
    await FinanceService.deleteRecord(id);
    return json({ success: true });
  } catch (error) {
    console.error('Finance DELETE error:', error);
    return json({ error: 'Failed to delete financial record' }, { status: 500 });
  }
}; 