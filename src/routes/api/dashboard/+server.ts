import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DashboardService } from '$lib/server/dashboard';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') as 'stats' | 'chart' | 'activity' | 'alerts' | null;
    const chartType = url.searchParams.get('chartType') as 'checkouts' | 'assets' | 'users' | 'categories' | null;
    const limit = parseInt(url.searchParams.get('limit') || '20');

    switch (type) {
      case 'stats': {
        const stats = await DashboardService.getDashboardStats();
        return json(stats);
      }
        
      case 'chart': {
        if (!chartType) {
          return json({ error: 'Chart type is required' }, { status: 400 });
        }
        const chartData = await DashboardService.getChartData(chartType);
        return json(chartData);
      }
        
      case 'activity': {
        const activity = await DashboardService.getRecentActivity(limit);
        return json(activity);
      }
        
      case 'alerts': {
        const alerts = await DashboardService.getAlertsSummary();
        return json(alerts);
      }
        
      default: {
        // Return all dashboard data
        const [stats, activity, alerts] = await Promise.all([
          DashboardService.getDashboardStats(),
          DashboardService.getRecentActivity(10),
          DashboardService.getAlertsSummary()
        ]);
        
        return json({
          stats,
          activity,
          alerts
        });
      }
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return json({ error: 'Failed to get dashboard data' }, { status: 500 });
  }
}; 