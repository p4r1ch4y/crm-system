import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/api.client';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      // backend returns {status,data:{tasks:[]}} maybe; inspect tasks route shape; fallback to tasks list
      const response: any = await apiClient.get('/tasks');
      const data = (response as any).data || response; // handle either shape
      const list: Task[] = data.tasks || data || [];
      setTasks(list);
    } catch (err: any) {
      console.error('Error fetching tasks', err);
      toast.error('Failed to load tasks');
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary">Add Task</button>
          <button onClick={fetchTasks} className="btn btn-secondary">Refresh</button>
        </div>
      </div>
      <div className="card bg-white dark:bg-gray-800">
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map(task => (
              <li key={task.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{task.status} • {task.priority}</div>
                  {task.dueDate && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">Due {new Date(task.dueDate).toLocaleDateString()}</div>
                  )}
                </div>
                <button className="text-primary-600 dark:text-primary-400 text-sm hover:underline">View</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
