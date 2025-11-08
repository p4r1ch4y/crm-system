import React from 'react';
import LogsViewer from '../components/common/LogsViewer';
import { useAppSelector } from '../hooks/redux';
import { Navigate } from 'react-router-dom';

const LogsPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">System Logs</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium mb-2">Application Log</h2>
          <LogsViewer type="main" />
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2">Audit Log</h2>
          <LogsViewer type="audit" />
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
