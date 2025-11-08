import React, { useEffect, useState } from 'react';
import { fetchLogs } from '../../services/logs.service';

interface Props {
  type?: 'audit' | 'main';
}

const LogsViewer: React.FC<Props> = ({ type = 'main' }) => {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchLogs({ 
        limit: 200, 
        search, 
        level,
        type,
        from: fromDate || undefined,
        to: toDate || undefined
      });
      setLines(data.records);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, level, fromDate, toDate, type]);

  const renderLogLine = (record: any, index: number) => {
    if (type === 'audit' && record.method) {
      // Structured audit log
      return (
        <div key={index} className="border-b border-gray-700 pb-1 mb-1">
          <div className="text-yellow-400">
            {new Date(record.ts).toLocaleString()} [{record.method}] {record.path} - {record.status}
          </div>
          <div className="text-gray-400 text-[10px]">
            User: {record.userId || 'N/A'} | IP: {record.ip} | Duration: {record.ms}ms
          </div>
        </div>
      );
    }
    // Plain text log
    return <div key={index}>{record.raw || JSON.stringify(record)}</div>;
  };

  return (
    <div className="p-4 bg-gray-800 text-sm rounded-md border border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <input
          type="text"
          placeholder="Search logs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
        >
          <option value="">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>
        <input
          type="datetime-local"
          placeholder="From"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
        />
        <input
          type="datetime-local"
          placeholder="To"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white text-xs"
        />
      </div>
      <div className="flex items-center mb-2 gap-2">
        <button
          onClick={load}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
        >
          Refresh
        </button>
        <button
          onClick={() => {
            setSearch('');
            setLevel('');
            setFromDate('');
            setToDate('');
          }}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
        >
          Clear Filters
        </button>
      </div>
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}
      <pre className="max-h-96 overflow-auto bg-black p-2 rounded text-[11px] leading-tight">
        {lines.map((record, i) => renderLogLine(record, i))}
      </pre>
    </div>
  );
};

export default LogsViewer;

