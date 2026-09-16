import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { WorkReport, Task, Client } from '../../types';
import {
  FileText,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Check,
  Sparkles,
} from 'lucide-react';

export const DailyReportSubmit: React.FC = () => {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskId, setTaskId] = useState('');
  const [clientId, setClientId] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [completedItems, setCompletedItems] = useState('');
  const [implementedItems, setImplementedItems] = useState('');
  const [hoursWorked, setHoursWorked] = useState('7.5');
  const [progressPercentage, setProgressPercentage] = useState('75');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [attachments, setAttachments] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, tRes, cRes] = await Promise.all([
        api.get('/reports'),
        api.get('/tasks'),
        api.get('/clients'),
      ]);
      setReports(rRes.data);
      setTasks(tRes.data);
      setClients(cRes.data);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      setError('Please specify what you worked on today');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('report_date', reportDate);
      if (taskId) formData.append('task_id', taskId);
      if (clientId) formData.append('client_id', clientId);
      formData.append('work_description', workDescription.trim());
      formData.append('completed_items', completedItems.trim());
      formData.append('implemented_items', implementedItems.trim());
      formData.append('hours_worked', hoursWorked);
      formData.append('progress_percentage', progressPercentage);
      formData.append('additional_notes', additionalNotes.trim());

      if (attachments) {
        for (let i = 0; i < attachments.length; i++) {
          formData.append('attachments', attachments[i]);
        }
      }

      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFeedback('Daily report submitted successfully! Status: Pending Approval. (+2 Points upon review).');
      setWorkDescription('');
      setCompletedItems('');
      setImplementedItems('');
      setAdditionalNotes('');
      setAttachments(null);

      loadData();
      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Daily Work Report & Output Verification
        </h2>
        <p className="text-xs text-slate-400">
          Document your daily operational execution. Every approved report awards +2 performance points.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2 shadow-lg">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Submission Form Card */}
      <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          Submit Today's Log ({reportDate})
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Report Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Task</label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">Select Task (Optional)...</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Client Account</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">Select Client (Optional)...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-300 mb-1">
                1. What Did You Work On? <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Detailed summary of features, designs, campaigns or code addressed..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1">
                2. What Did You Complete?
              </label>
              <textarea
                rows={3}
                value={completedItems}
                onChange={(e) => setCompletedItems(e.target.value)}
                placeholder="Finished screens, PRs merged, campaigns published..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">
                3. What Did You Implement?
              </label>
              <textarea
                rows={3}
                value={implementedItems}
                onChange={(e) => setImplementedItems(e.target.value)}
                placeholder="New technical libraries, responsive layouts, color gradings..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Worked</label>
              <input
                type="number"
                step="0.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Task Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Proof Files / Screenshots</label>
              <input
                type="file"
                multiple
                onChange={(e) => setAttachments(e.target.files)}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-indigo-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Notes</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Blockers, tomorrow's plan, questions for management..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Daily Work Report'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History of Previous Submissions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Previous Submissions & Feedback</h3>
        {reports.map((rep) => (
          <div
            key={rep.id}
            className={`p-4 bg-[#111827] border rounded-xl text-xs space-y-2 transition ${
              rep.status === 'REJECTED'
                ? 'border-red-500/30 bg-red-500/5'
                : rep.status === 'APPROVED'
                ? 'border-slate-800'
                : 'border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{rep.report_date}</span>
                {rep.client_name && (
                  <span className="text-[10px] text-slate-400">({rep.client_name})</span>
                )}
                <span className="text-[10px] text-emerald-400 font-semibold">{rep.hours_worked} hrs</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rep.status === 'APPROVED'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : rep.status === 'REJECTED'
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {rep.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">{rep.work_description}</p>

            {rep.status === 'REJECTED' && rep.rejection_reason && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-300">
                <strong className="text-red-400">Admin Rejection Feedback:</strong> {rep.rejection_reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
