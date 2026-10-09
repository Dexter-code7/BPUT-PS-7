import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatDateTime12 } from '../utils/dateUtils';
import { Clock, ShieldCheck, Activity } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs(50);
      setLogs(res?.data?.logs || []);
    } catch (err) {
      console.warn('Could not load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Institutional Audit Trail</h1>
            <div className="card-subtitle">
              Immutable ledger of campus logins, permission modifications, profile updates, and administrative actions
            </div>
          </div>
          <span className="badge badge-neutral">
            <Clock size={12} />
            Real-time Audit Ledger
          </span>
        </div>

        {isLoading ? (
          <div className="loading-box">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="loading-box">No audit events logged yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Username</th>
                  <th>Institutional Role</th>
                  <th>Action Code</th>
                  <th>Target Entity</th>
                  <th>IP Address</th>
                  <th>Payload Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatDateTime12(log.created_at)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {log.username || 'System Event'}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {log.user_role || 'System'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '10px', textTransform: 'none', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {log.ip_address}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '240px', wordBreak: 'break-all' }}>
                      {log.payload || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
