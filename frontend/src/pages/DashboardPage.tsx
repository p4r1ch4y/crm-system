import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { DashboardAnalytics } from '../types';
import toast from 'react-hot-toast';
import StatusDistributionChart from '../components/dashboard/StatusDistributionChart';
import PriorityBreakdownChart from '../components/dashboard/PriorityBreakdownChart';
import ConversionFunnelChart from '../components/dashboard/ConversionFunnelChart';

const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard analytics...');
        const data = await analyticsService.getDashboardAnalytics();
        console.log('Dashboard data received:', data);
        setAnalytics(data);
      } catch (error: any) {
        console.error('Failed to fetch dashboard analytics:', error);
        console.error('Error details:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        setError(errorMsg);
        toast.error(`Failed to load dashboard data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400 mb-4">Error loading dashboard</div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-white dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {analytics.overview.totalLeads}
          </p>
        </div>
        <div className="card bg-white dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Won Deals</h3>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400 mt-2">
            {analytics.overview.wonDeals}
          </p>
        </div>
        <div className="card bg-white dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
            ${analytics.overview.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="card bg-white dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {analytics.overview.leadsThisMonth}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {analytics.overview.growthRate > 0 ? '+' : ''}
            {analytics.overview.growthRate}% growth
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Status Distribution
          </h2>
          {analytics.leadsByStatus.length > 0 ? (
            <StatusDistributionChart data={analytics.leadsByStatus} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
        <div className="card bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Priority Breakdown
          </h2>
          {analytics.leadsByPriority.length > 0 ? (
            <PriorityBreakdownChart data={analytics.leadsByPriority} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="card bg-white dark:bg-gray-800 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Conversion Funnel
        </h2>
        {analytics.leadsByStatus.length > 0 ? (
          <ConversionFunnelChart data={analytics.leadsByStatus} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        )}
      </div>

      {/* Activities and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activities</h2>
          {analytics.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="border-l-2 border-primary-500 dark:border-primary-400 pl-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{activity.subject}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{activity.type}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No activities yet</p>
          )}
        </div>
        <div className="card bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Tasks</h2>
          {analytics.upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {analytics.upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{task.status}</div>
                  </div>
                  {task.dueDate && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
