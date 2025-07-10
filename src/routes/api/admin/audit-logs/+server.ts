import { json } from '@sveltejs/kit';
import { AuditService } from '$lib/server/audit';
import { requireAdmin } from '$lib/server/routeProtection';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  try {
    await requireAdmin(event);
    
    const { url } = event;
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const userId = url.searchParams.get('userId') || undefined;
    const entityType = url.searchParams.get('entityType') || undefined;
    const entityId = url.searchParams.get('entityId') || undefined;
    const action = url.searchParams.get('action') || undefined;
    const severity = url.searchParams.get('severity') || undefined;
    const startDate = url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')!) : undefined;
    const endDate = url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')!) : undefined;

    const filters = {
      userId,
      entityType,
      entityId,
      action,
      severity,
      startDate,
      endDate
    };

    const result = await AuditService.getAuditLogs(filters, page, limit);

    return json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}; 