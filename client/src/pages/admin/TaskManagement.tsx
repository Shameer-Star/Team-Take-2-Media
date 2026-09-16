import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Task, User } from '../../types';
import { TaskModal } from '../../components/TaskModal';
import { RejectionModal } from '../../components/RejectionModal';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  User as UserIcon,
  Paperclip,
  MessageSquare,
  Trash2,
  Edit,
  Sparkles,
} from 'lucide-react';

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadTasks();
    api.get('/users').then((res) => setMembers(res.data)).catch(console.error);
  }, [statusFilter, priorityFilter, memberFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (memberFilter) params.assigned_to_id = memberFilter;

      const res = await api.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTask = async (task: Task) => {
    try {
      const res = await api.post(`/tasks/${task.id}/approve`);
      setFeedback(`Task "${task.title}" approved! Awarded +${res.data.points_awarded} points.`);
      loadTasks();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve task');
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!taskToReject) return;
    await api.post(`/tasks/${taskToReject.id}/reject`, { rejection_reason: reason });
    setFeedback(`Task returned for revision with feedback.`);
    loadTasks();
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'SUBMITTED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse';
      case 'IN_PROGRESS':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'REJECTED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Task Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Task Orchestration & Approvals
          </h2>
          <p className="text-xs text-slate-400">
            Lifecycle: TO DO → IN PROGRESS → SUBMITTED → APPROVED (Points Awarded).
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setShowTaskModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted (Pending Review)</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="TO_DO">To Do</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Assigned Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {(statusFilter || priorityFilter || memberFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setMemberFilter('');
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tasks Table / Cards */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-2xl">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-400">No tasks found matching criteria.</div>
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className={`p-4 bg-[#111827] border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-md ${
                t.status === 'SUBMITTED'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : t.status === 'REJECTED'
                  ? 'border-red-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Left Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadge(t.status)}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getPriorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                  {t.client_name && (
                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {t.client_name}
                    </span>
                  )}
                  {t.project_name && (
                    <span className="text-[10px] text-indigo-300 font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {t.project_name}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">{t.title}</h3>
                  {t.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Submissions or Rejection notes */}
                {t.status === 'SUBMITTED' && t.submission_notes && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                    <span className="font-bold">Member Submission Notes:</span> {t.submission_notes}
                  </div>
                )}

                {t.status === 'REJECTED' && t.rejection_reason && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                    <span className="font-bold">Rejection Feedback:</span> {t.rejection_reason}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assigned: <strong className="text-slate-200">{t.assigned_to_name}</strong></span>
                  </div>
                  {t.deadline && (
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{t.deadline.split('T')[0]}</strong></span>
                    </div>
                  )}
                  <div>
                    <span>Est: <strong className="text-slate-200">{t.estimated_hours}h</strong></span>
                  </div>
                  <div>
                    <span>Progress: <strong className="text-indigo-400">{t.progress_percentage}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                {t.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => handleApproveTask(t)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve (+Points)</span>
                    </button>
                    <button
                      onClick={() => {
                        setTaskToReject(t);
                        setShowRejectModal(true);
                      }}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setTaskToEdit(t);
                    setShowTaskModal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
                  title="Edit Task"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg transition"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSuccess={loadTasks}
        taskToEdit={taskToEdit}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmRejection}
        title="Reject Task Submission"
        itemTitle={taskToReject?.title}
      />
    </div>
  );
};
