import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Lead } from '../../types';
import { LeadModal } from '../../components/LeadModal';
import {
  TrendingUp,
  Plus,
  ArrowRight,
  DollarSign,
  UserCheck,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Building2,
  Trash2,
  Edit,
} from 'lucide-react';

const STAGES: { key: Lead['stage']; label: string; color: string }[] = [
  { key: 'NEW_LEAD', label: 'New Lead', color: 'border-slate-700 bg-slate-800/40 text-slate-300' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-blue-500/30 bg-blue-500/5 text-blue-300' },
  { key: 'INTERESTED', label: 'Interested', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300' },
  { key: 'MEETING', label: 'Meeting', color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-300' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'border-purple-500/30 bg-purple-500/5 text-purple-300' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
  { key: 'WON', label: 'Won 🎉', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { key: 'LOST', label: 'Lost', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
];

export const LeadPipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data.leads || []);
      setMetrics(res.data.metrics || {});
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (leadId: string, newStage: Lead['stage']) => {
    try {
      await api.patch(`/leads/${leadId}/stage`, { stage: newStage });
      loadLeads();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update stage');
    }
  };

  const handleConvertToClient = async (lead: Lead) => {
    if (!window.confirm(`Convert ${lead.company} into an active company Client account?`)) return;
    try {
      await api.post(`/leads/${lead.id}/convert-to-client`);
      setFeedback(`🎉 ${lead.company} successfully converted into active Client!`);
      loadLeads();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to convert lead to client');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Delete this deal lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      loadLeads();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete lead');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Lead */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Take Two Media Sales CRM Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Manage deals through 8 progressive stages. Won deals convert directly to active clients.
          </p>
        </div>

        <button
          onClick={() => {
            setLeadToEdit(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deal Lead</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Funnel Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Total Leads</span>
          <div className="text-base font-black text-white">{metrics.total_leads || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">New</span>
          <div className="text-base font-black text-indigo-400">{metrics.new_leads || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Contacted</span>
          <div className="text-base font-black text-blue-400">{metrics.contacted || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Meetings</span>
          <div className="text-base font-black text-cyan-400">{metrics.meetings || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Proposals</span>
          <div className="text-base font-black text-purple-400">{metrics.proposals || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Won Deals</span>
          <div className="text-base font-black text-emerald-400">{metrics.won || 0}</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Conversion</span>
          <div className="text-base font-black text-white">{metrics.conversion_rate || 0}%</div>
        </div>
        <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-slate-500">Pipeline Val</span>
          <div className="text-base font-black text-emerald-400">${(metrics.pipeline_value || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          const stageTotal = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);

          return (
            <div
              key={stage.key}
              className="w-72 shrink-0 bg-[#0F172A]/80 border border-slate-800/90 rounded-2xl p-3 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${stage.key === 'WON' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span className="text-xs font-bold text-white">{stage.label}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">{stageLeads.length}</span> deals • ${stageTotal.toLocaleString()}
                </div>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-500 italic">
                    Empty stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl transition shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <h4 className="text-xs font-bold text-white tracking-tight">{lead.company}</h4>
                          <span className="text-[10px] font-black text-emerald-400">
                            ${lead.budget?.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 mb-2 font-medium">
                          {lead.name}
                        </div>

                        <div className="text-[10px] text-slate-400 space-y-1 mb-2">
                          <div className="truncate">Source: <strong className="text-slate-300">{lead.source}</strong></div>
                          {lead.interested_service && (
                            <div className="truncate">Service: <strong className="text-indigo-300">{lead.interested_service}</strong></div>
                          )}
                          <div>Assigned: <strong className="text-slate-300">{lead.assigned_to_name || 'Unassigned'}</strong></div>
                        </div>

                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 italic bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60 mb-2">
                            "{lead.notes}"
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {lead.stage === 'WON' ? (
                          <button
                            onClick={() => handleConvertToClient(lead)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1"
                          >
                            <Building2 className="w-3 h-3" />
                            <span>Convert to Client</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as any)}
                              className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5"
                            >
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setLeadToEdit(lead);
                              setShowModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1 text-slate-400 hover:text-red-400 bg-slate-800 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadLeads}
        leadToEdit={leadToEdit}
      />
    </div>
  );
};
