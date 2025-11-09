import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Badge: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {ok ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
    {ok ? 'Configured' : 'Not configured'}
  </span>
);

const IntegrationsPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testMsg, setTestMsg] = useState('Hello from CRM!');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/integrations/status`, { withCredentials: true });
        setStatus(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const sendTest = async () => {
    setSending(true);
    try {
      await axios.post(`${API_BASE}/integrations/slack/test`, { text: testMsg }, { withCredentials: true });
      alert('Test message sent to Slack (if configured)');
    } catch (e) {
      alert('Failed to send Slack message. Ensure SLACK_WEBHOOK_URL is set in backend.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integrations</h1>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading status...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Slack</h2>
            <Badge ok={!!status?.slack?.configured} />
          </div>
          <p className="text-sm text-gray-600 mb-4">Send alerts and notifications to your Slack workspace via Incoming Webhooks.</p>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Create a Slack Incoming Webhook (Apps → Incoming Webhooks)</li>
            <li>Copy the Webhook URL</li>
            <li>Set it in backend env as <code>SLACK_WEBHOOK_URL</code> and restart backend</li>
          </ol>
          <div className="flex items-center space-x-2">
            <input className="input" value={testMsg} onChange={(e) => setTestMsg(e.target.value)} placeholder="Test message" />
            <button className="btn btn-primary flex items-center" onClick={sendTest} disabled={sending}>
              <Send className="w-4 h-4 mr-1" />
              {sending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">HubSpot (Planned)</h2>
            <Badge ok={!!status?.hubspot?.configured} />
          </div>
          <p className="text-sm text-gray-600">Connect to HubSpot for contact sync and workflows. Coming soon.</p>
        </div>

        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Inbound Webhooks</h2>
          <p className="text-sm text-gray-600 mb-3">Receive events from external systems at <code>/api/v1/integrations/webhook/inbound</code>.</p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 border">
            <pre>{`POST /api/v1/integrations/webhook/inbound\nContent-Type: application/json\n\n{\n  "event": "lead.created",\n  "source": "partner-system",\n  "payload": { "name": "John Doe", "email": "john@example.com" }\n}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;