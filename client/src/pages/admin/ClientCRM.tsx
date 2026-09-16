import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Client } from '../../types';
import { ClientModal } from '../../components/ClientModal';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Briefcase,
  CheckSquare,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  X,
} from 'lucide-react';

export const ClientCRM: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Client Details Modal
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, [statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/clients', { params });
      setClients(res.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClientDetails = async (id: string) => {
    try {
      const res = await api.get(`/clients/${id}`);
      setSelectedClient(res.data);
    } catch (err) {
      console.error('Failed to load client details:', err);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client account?')) return;
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete client');
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Active':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Completed':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Prospect':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Lead':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Client Accounts & Enterprise CRM
          </h2>
          <p className="text-xs text-slate-400">
            Active corporate accounts, deliverables breakdown, and contracted service scopes.
          </p>
        </div>

        <button
          onClick={() => {
            setClientToEdit(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadClients()}
            placeholder="Search company, contact person, or industry..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Prospect">Prospect</option>
          <option value="Completed">Completed</option>
          <option value="Lead">Lead</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl transition shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{c.company_name}</h3>
                  <div className="text-[11px] text-indigo-400 font-semibold">{c.industry || 'Media & Tech'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(c.status)}`}>
                  {c.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                <div className="flex items-center space-x-2 text-slate-300 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.contact_person}</span>
                </div>
                {c.email && (
                  <div className="flex items-center space-x-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.email}</span>
                  </div>
                )}
                {c.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.location}</span>
                  </div>
                )}
              </div>

              {/* Service & Budget Pill */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 mb-4">
                <div className="text-[11px] text-slate-300 font-medium">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Services:</span>
                  {c.service || 'Full Digital Transformation'}
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Account Value:</span>
                  <span className="font-black text-emerald-400">${c.budget?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>Projects: <strong className="text-white">{c.total_projects || 0}</strong></span>
                <span>Active Tasks: <strong className="text-indigo-400">{c.total_tasks || 0}</strong></span>
                <span>Lead: <strong className="text-slate-300">{c.assigned_member_name || 'Unassigned'}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleOpenClientDetails(c.id)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>View Overview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setClientToEdit(c);
                    setShowModal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClient(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {selectedClient.company_name}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{selectedClient.industry} • Contact: {selectedClient.contact_person}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Budget</span>
                <div className="text-lg font-black text-emerald-400">${selectedClient.budget?.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Projects</span>
                <div className="text-lg font-black text-white">{selectedClient.projects?.length || 0}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Tasks</span>
                <div className="text-lg font-black text-indigo-300">{selectedClient.tasks?.length || 0}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Account Lead</span>
                <div className="text-xs font-bold text-white truncate mt-1">{selectedClient.assigned_member_name || 'None'}</div>
              </div>
            </div>

            {/* Projects for this client */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Projects</h4>
              <div className="space-y-2">
                {selectedClient.projects?.map((p: any) => (
                  <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{p.project_name}</div>
                      <div className="text-[10px] text-slate-400">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">${p.budget?.toLocaleString()}</div>
                      <span className="text-[10px] text-indigo-400">{p.progress_percentage}% Done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks for this client */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Active Tasks</h4>
              <div className="space-y-1.5">
                {selectedClient.tasks?.map((t: any) => (
                  <div key={t.id} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{t.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">Assigned: {t.assigned_to_name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-indigo-300">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadClients}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};
