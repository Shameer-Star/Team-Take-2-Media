import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Project } from '../../types';
import { ProjectModal } from '../../components/ProjectModal';
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Review':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Planning':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Client Projects Portfolio
          </h2>
          <p className="text-xs text-slate-400">
            Multi-service delivery pipelines, sprint progress, and team assignments.
          </p>
        </div>

        <button
          onClick={() => {
            setProjectToEdit(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#111827] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Project Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Planning">Planning</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="p-5 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-2xl transition shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  {p.client_name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{p.project_name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {p.description || 'Deliverable roadmap across branding and tech engineering.'}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Milestone Progress</span>
                  <span className="font-bold text-indigo-400">{p.progress_percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${p.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-900/80 border border-slate-800 rounded-xl mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Budget</span>
                  <span className="font-black text-emerald-400">${p.budget?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Target Deadline</span>
                  <span className="font-bold text-slate-300">
                    {p.deadline ? p.deadline.split('T')[0] : 'Open Schedule'}
                  </span>
                </div>
              </div>

              {/* Assigned Members */}
              {p.members && p.members.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">Project Squad</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.members.map((m) => (
                      <span
                        key={m.user_id}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Tasks: <strong className="text-white">{p.total_tasks || 0}</strong>
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setProjectToEdit(p);
                    setShowModal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadProjects}
        projectToEdit={projectToEdit}
      />
    </div>
  );
};
