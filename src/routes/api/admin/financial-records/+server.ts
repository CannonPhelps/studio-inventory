import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/routeProtection';
import { FinanceService } from '$lib/server/finance';

export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const { url } = event;
    const type = url.searchParams.get('type') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const assetId = url.searchParams.get('assetId') ? Number(url.searchParams.get('assetId')) : undefined;
    const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')!) : undefined;
    const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')!) : undefined;
    const skip = url.searchParams.get('skip') ? Number(url.searchParams.get('skip')) : undefined;
    const take = url.searchParams.get('take') ? Number(url.searchParams.get('take')) : undefined;

    const result = await FinanceService.listRecords({ type, category, assetId, startDate, endDate, skip, take });
    return json(result);
  } catch (error) {
    console.error('Finance GET error:', error);
    return json({ error: 'Failed to fetch financial records' }, { status: 500 });
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    const data = await event.request.json();
    const record = await FinanceService.addRecord(data);
    return json(record);
  } catch (error) {
    console.error('Finance POST error:', error);
    return json({ error: 'Failed to create financial record' }, { status: 500 });
  }
}; 