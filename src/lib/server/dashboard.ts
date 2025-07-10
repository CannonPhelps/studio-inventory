import { prisma } from '$lib/db';

export interface DashboardStats {
  assets: {
    total: number;
    available: number;
    checkedOut: number;
    maintenance: number;
    lowStock: number;
    totalValue: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
  };
  checkouts: {
    total: number;
    active: number;
    overdue: number;
    thisMonth: number;
    lastMonth: number;
  };
  categories: {
    total: number;
    topCategories: Array<{ name: string; count: number; value: number }>;
  };
  financial: {
    totalValue: number;
    monthlySpending: number;
    averageAssetValue: number;
    depreciation: number;
  };
  system: {
    lastBackup: string | null;
    diskUsage: number;
    activeUsers: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export interface RecentActivity {
  id: string;
  type: 'checkout' | 'return' | 'maintenance' | 'import' | 'user' | 'asset';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Asset statistics
      const [
        totalAssets,
        availableAssets,
        checkedOutAssets,
        maintenanceAssets,
        lowStockAssets,
        assetValues,
        totalUsers,
        activeUsers,
        adminUsers,
        totalCheckouts,
        activeCheckouts,
        overdueCheckouts,
        monthlyCheckouts,
        lastMonthCheckouts,
        categories,
        topCategories,
        systemHealth
      ] = await Promise.all([
        // Asset counts
        prisma.asset.count(),
        prisma.asset.count({ where: { status: 'Available' } }),
        prisma.asset.count({ where: { status: 'Checked Out' } }),
        prisma.asset.count({ 
          where: { 
            lastMaintenance: { 
              lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
            } 
          } 
        }),
        prisma.asset.count({ where: { quantity: { lte: 2 } } }),
        
        // Asset values
        prisma.asset.aggregate({
          _sum: { purchasePrice: true },
          _avg: { purchasePrice: true }
        }),
        
        // User statistics
        prisma.user.count(),
        prisma.user.count({ 
          where: { 
            updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
          } 
        }),
        prisma.user.count({ where: { role: 'admin' } }),
        
        // Checkout statistics
        prisma.checkout.count(),
        prisma.checkout.count({ where: { returnedAt: null } }),
        prisma.checkout.count({ 
          where: { 
            returnedAt: null,
            dueAt: { lt: new Date() }
          } 
        }),
        prisma.checkout.count({
          where: {
            checkoutAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.checkout.count({
          where: {
            checkoutAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Category statistics
        prisma.category.count(),
        prisma.category.findMany({
          include: {
            assets: {
              select: {
                purchasePrice: true
              }
            }
          }
        }),
        
        // System health check
        this.checkSystemHealth()
      ]);

      // Calculate top categories
      const categoryStats = topCategories.map(category => ({
        name: category.name,
        count: category.assets.length,
        value: category.assets.reduce((sum, asset) => 
          sum + (asset.purchasePrice ? Number(asset.purchasePrice) : 0), 0
        )
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      return {
        assets: {
          total: totalAssets,
          available: availableAssets,
          checkedOut: checkedOutAssets,
          maintenance: maintenanceAssets,
          lowStock: lowStockAssets,
          totalValue: assetValues._sum.purchasePrice ? Number(assetValues._sum.purchasePrice) : 0
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers
        },
        checkouts: {
          total: totalCheckouts,
          active: activeCheckouts,
          overdue: overdueCheckouts,
          thisMonth: monthlyCheckouts,
          lastMonth: lastMonthCheckouts
        },
        categories: {
          total: categories,
          topCategories: categoryStats
        },
        financial: {
          totalValue: assetValues._sum.purchasePrice ? Number(assetValues._sum.purchasePrice) : 0,
          monthlySpending: 0, // Would need to track purchases
          averageAssetValue: assetValues._avg.purchasePrice ? Number(assetValues._avg.purchasePrice) : 0,
          depreciation: 0 // Would need depreciation calculation
        },
        system: {
          lastBackup: null, // Would integrate with backup service
          diskUsage: Math.round((totalAssets / 1000) * 100), // Mock calculation
          activeUsers: activeUsers,
          systemHealth
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  /**
   * Get chart data for various metrics
   */
  static async getChartData(type: 'checkouts' | 'assets' | 'users' | 'categories'): Promise<ChartData> {
    try {
      switch (type) {
        case 'checkouts':
          return await this.getCheckoutChartData();
        case 'assets':
          return await this.getAssetChartData();
        case 'users':
          return await this.getUserChartData();
        case 'categories':
          return await this.getCategoryChartData();
        default:
          throw new Error('Invalid chart type');
      }
    } catch (error) {
      console.error('Error getting chart data:', error);
      throw new Error('Failed to get chart data');
    }
  }

  /**
   * Get checkout trends over time
   */
  private static async getCheckoutChartData(): Promise<ChartData> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const checkoutData = await Promise.all(
      last30Days.map(async (date) => {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const count = await prisma.checkout.count({
          where: {
            checkoutAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        return count;
      })
    );

    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Checkouts',
        data: checkoutData,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)'
      }]
    };
  }

  /**
   * Get asset distribution by category
   */
  private static async getAssetChartData(): Promise<ChartData> {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });

    return {
      labels: categories.map(cat => cat.name),
      datasets: [{
        label: 'Assets',
        data: categories.map(cat => cat._count.assets),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }]
    };
  }

  /**
   * Get user activity data
   */
  private static async getUserChartData(): Promise<ChartData> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const userData = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const count = await prisma.user.count({
          where: {
            updatedAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        return count;
      })
    );

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Active Users',
        data: userData,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)'
      }]
    };
  }

  /**
   * Get category value distribution
   */
  private static async getCategoryChartData(): Promise<ChartData> {
    const categories = await prisma.category.findMany({
      include: {
        assets: {
          select: {
            purchasePrice: true
          }
        }
      }
    });

    const categoryValues = categories.map(cat => ({
      name: cat.name,
      value: cat.assets.reduce((sum, asset) => 
        sum + (asset.purchasePrice ? Number(asset.purchasePrice) : 0), 0
      )
    })).sort((a, b) => b.value - a.value).slice(0, 10);

    return {
      labels: categoryValues.map(cat => cat.name),
      datasets: [{
        label: 'Total Value ($)',
        data: categoryValues.map(cat => cat.value),
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 1)'
      }]
    };
  }

  /**
   * Get recent activity feed
   */
  static async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    try {
      const [checkouts, returns, maintenance, auditLogs] = await Promise.all([
        prisma.checkout.findMany({
          take: limit,
          orderBy: { checkoutAt: 'desc' },
          include: { asset: true }
        }),
        prisma.checkout.findMany({
          where: { returnedAt: { not: null } },
          take: limit,
          orderBy: { returnedAt: 'desc' },
          include: { asset: true }
        }),
        prisma.maintenanceRecord.findMany({
          take: limit,
          orderBy: { performedAt: 'desc' },
          include: { asset: true }
        }),
                 prisma.auditLog.findMany({
           take: limit,
           orderBy: { timestamp: 'desc' },
           where: {
             action: { in: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] }
           }
         })
      ]);

      const activities: RecentActivity[] = [];

      // Process checkouts
      checkouts.forEach(checkout => {
        activities.push({
          id: `checkout-${checkout.id}`,
          type: 'checkout',
          title: 'Asset Checked Out',
          description: `${checkout.asset.itemName} checked out by ${checkout.user}`,
          timestamp: checkout.checkoutAt.toISOString(),
          user: checkout.user,
          severity: 'info'
        });
      });

      // Process returns
      returns.forEach(returnItem => {
        activities.push({
          id: `return-${returnItem.id}`,
          type: 'return',
          title: 'Asset Returned',
          description: `${returnItem.asset.itemName} returned by ${returnItem.user}`,
          timestamp: returnItem.returnedAt!.toISOString(),
          user: returnItem.user,
          severity: 'success'
        });
      });

      // Process maintenance
      maintenance.forEach(record => {
        activities.push({
          id: `maintenance-${record.id}`,
          type: 'maintenance',
          title: 'Maintenance Performed',
          description: `Maintenance performed on ${record.asset.itemName}`,
          timestamp: record.performedAt.toISOString(),
          user: record.performedBy || 'System',
          severity: 'warning'
        });
      });

      // Process audit logs
      auditLogs.forEach(log => {
        activities.push({
          id: `audit-${log.id}`,
          type: 'asset',
          title: `${log.action} ${log.entityType}`,
          description: log.details || `${log.action} performed on ${log.entityType}`,
          timestamp: log.timestamp.toISOString(),
          user: log.userId || 'System',
                     severity: log.severity.toLowerCase() as 'info' | 'warning' | 'error' | 'success'
        });
      });

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error('Failed to get recent activity');
    }
  }

  /**
   * Check system health
   */
  private static async checkSystemHealth(): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      const [
        overdueCheckouts,
        lowStockAssets,
        maintenanceNeeded,
        failedLogins
      ] = await Promise.all([
        prisma.checkout.count({
          where: {
            returnedAt: null,
            dueAt: { lt: new Date() }
          }
        }),
        prisma.asset.count({
          where: { quantity: { lte: 2 } }
        }),
        prisma.asset.count({
          where: {
            lastMaintenance: {
              lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.auditLog.count({
          where: {
            action: 'LOGIN_FAILED',
            timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      if (failedLogins > 10 || overdueCheckouts > 20) {
        return 'critical';
      } else if (lowStockAssets > 5 || maintenanceNeeded > 10) {
        return 'warning';
      } else {
        return 'healthy';
      }
    } catch (error) {
      console.error('Error checking system health:', error);
      return 'warning';
    }
  }

  /**
   * Get alerts and notifications summary
   */
  static async getAlertsSummary(): Promise<{
    overdue: number;
    lowStock: number;
    maintenance: number;
    security: number;
  }> {
    try {
      const [overdue, lowStock, maintenance, security] = await Promise.all([
        prisma.checkout.count({
          where: {
            returnedAt: null,
            dueAt: { lt: new Date() }
          }
        }),
        prisma.asset.count({
          where: { quantity: { lte: 2 } }
        }),
        prisma.asset.count({
          where: {
            lastMaintenance: {
              lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.auditLog.count({
          where: {
            action: 'LOGIN_FAILED',
            timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      return { overdue, lowStock, maintenance, security };
    } catch (error) {
      console.error('Error getting alerts summary:', error);
      return { overdue: 0, lowStock: 0, maintenance: 0, security: 0 };
    }
  }
} 