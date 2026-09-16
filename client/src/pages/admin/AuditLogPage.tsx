import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AuditLogItem } from '../../types';
import { ShieldCheck, Filter, Calendar, User, Search } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, entityFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Immutable Audit Trail & Activity Log
          </h2>
          <p className="text-xs text-slate-400">
            Chronological compliance record of all actions, approvals, rejections, and point modifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#111827] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="POINTS_AWARDED">Points Awarded</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#111827] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="TASK">Tasks</option>
            <option value="REPORT">Reports</option>
            <option value="CLIENT">Clients</option>
            <option value="LEAD">Leads</option>
            <option value="USER">Users</option>
            <option value="POINTS">Points</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {log.user_name || 'System / Guest'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        log.action === 'APPROVE'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : log.action === 'REJECT'
                          ? 'bg-red-500/10 text-red-300 border-red-500/20'
                          : log.action === 'CREATE'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans font-semibold">
                    {log.entity_type}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans font-medium leading-relaxed">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
