import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/api.client';
import { Activity } from '../types';

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      // activities endpoint shape: {status,data:{activities:[]}} or just array
      const response: any = await apiClient.get('/activities');
      const data = (response as any).data || response;
      const list: Activity[] = data.activities || data || [];
      setActivities(list);
    } catch (err: any) {
      console.error('Error fetching activities', err);
      toast.error('Failed to load activities');
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Activities</h1>
      <div className="card bg-white dark:bg-gray-800">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading activities...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No activities found</p>
        ) : (
          <ul className="space-y-3">
            {activities.map(act => (
              <li key={act.id} className="border-l-2 border-primary-500 dark:border-primary-400 pl-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{act.subject}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{act.type}</div>
                    {act.lead && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">Lead: {act.lead.firstName} {act.lead.lastName}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(act.createdAt).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
