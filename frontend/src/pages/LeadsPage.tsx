import React, { useEffect, useState } from 'react';
import { leadService } from '../services/lead.service';
import { Lead, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<Lead>["pagination"] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: 'NEW',
    priority: 'MEDIUM',
    value: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.firstName || !newLead.lastName || !newLead.email) {
      toast.error('First name, last name, and email are required');
      return;
    }
    try {
      setCreating(true);
      const created = await leadService.createLead({
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        email: newLead.email,
        status: newLead.status as any,
        priority: newLead.priority as any,
        value: newLead.value ? Number(newLead.value) : undefined,
        tags: [],
      });
      toast.success('Lead created');
      setShowCreate(false);
      setNewLead({ firstName: '', lastName: '', email: '', status: 'NEW', priority: 'MEDIUM', value: '' });
      // Prepend or refetch
      setLeads(prev => [created, ...prev]);
    } catch (err: any) {
      console.error('Create lead error', err);
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const fetchLeads = async (pageParam = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await leadService.getLeads({ page: pageParam, limit: 10 });
      setLeads(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('Error fetching leads', err);
      toast.error('Failed to load leads');
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Leads</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Add Lead</button>
          <button onClick={() => fetchLeads(page)} className="btn btn-secondary">Refresh</button>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 overflow-x-auto">
        {showCreate && (
          <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  className="input mt-1"
                  value={newLead.firstName}
                  onChange={e => setNewLead(l => ({ ...l, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  className="input mt-1"
                  value={newLead.lastName}
                  onChange={e => setNewLead(l => ({ ...l, lastName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  className="input mt-1"
                  value={newLead.email}
                  onChange={e => setNewLead(l => ({ ...l, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  className="input mt-1"
                  value={newLead.status}
                  onChange={e => setNewLead(l => ({ ...l, status: e.target.value }))}
                >
                  {['NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <select
                  className="input mt-1"
                  value={newLead.priority}
                  onChange={e => setNewLead(l => ({ ...l, priority: e.target.value }))}
                >
                  {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value (USD)</label>
                <input
                  type="number"
                  className="input mt-1"
                  value={newLead.value}
                  onChange={e => setNewLead(l => ({ ...l, value: e.target.value }))}
                />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-success"
                >{creating ? 'Creating...' : 'Create Lead'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading leads...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : leads.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No leads found</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{lead.firstName} {lead.lastName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="badge badge-primary">{lead.status}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="badge badge-gray">{lead.priority}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{lead.value ? '$'+lead.value.toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                    <button className="text-primary-600 dark:text-primary-400 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination && leads.length > 0 && (
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >Prev</button>
              <button
                disabled={pagination && page >= pagination.totalPages}
                onClick={() => setPage(p => (pagination ? Math.min(pagination.totalPages, p + 1) : p + 1))}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
