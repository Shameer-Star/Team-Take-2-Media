import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Task } from '../../types';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  UploadCloud,
  CheckCircle2,
  FileText,
  Paperclip,
  X,
  Sparkles,
} from 'lucide-react';

export const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [actualHours, setActualHours] = useState('8');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Upload proof
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: 'IN_PROGRESS', progress_percentage: 20 });
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start task');
    }
  };

  const handleProgressChange = async (taskId: string, newProgress: number) => {
    try {
      await api.put(`/tasks/${taskId}`, { progress_percentage: newProgress });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress_percentage: newProgress } : t));
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setSubmitting(true);

      // 1. If file proof attached, upload to task
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        await api.post(`/tasks/${selectedTask.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 2. Submit task
      const res = await api.post(`/tasks/${selectedTask.id}/submit`, {
        submission_notes: submissionNotes.trim(),
        actual_hours: parseFloat(actualHours) || 8,
      });

      setFeedback(res.data.message || 'Work submitted for admin review!');
      setSelectedTask(null);
      setSubmissionNotes('');
      setFileToUpload(null);
      loadTasks();

      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
          My Assigned Deliverables & Tasks
        </h2>
        <p className="text-xs text-slate-400">
          Start work, track progress percentage, and submit finished deliverables with proof files for approval.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2 shadow-lg">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-2xl">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-400">You currently have no assigned tasks.</div>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 bg-[#111827] border rounded-2xl space-y-4 transition shadow-xl ${
                task.status === 'REJECTED'
                  ? 'border-red-500/40 bg-red-500/5'
                  : task.status === 'SUBMITTED'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : task.status === 'APPROVED'
                  ? 'border-emerald-500/30'
                  : 'border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : task.status === 'SUBMITTED'
                          ? 'bg-amber-500/15 text-amber-300 animate-pulse'
                          : task.status === 'REJECTED'
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-indigo-500/15 text-indigo-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Priority: {task.priority}
                    </span>
                    {task.client_name && (
                      <span className="text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded bg-slate-900">
                        {task.client_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                </div>

                <div className="text-right text-xs">
                  {task.deadline && (
                    <div className="text-slate-400 text-[11px] flex items-center space-x-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{task.deadline.split('T')[0]}</strong></span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500">Estimated: {task.estimated_hours} hours</span>
                </div>
              </div>

              {/* Task Details */}
              {task.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
              )}

              {task.required_deliverables && (
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                    Required Deliverables:
                  </span>
                  <p className="text-slate-300 text-[11px]">{task.required_deliverables}</p>
                </div>
              )}

              {/* Rejection Alert if rejected */}
              {task.status === 'REJECTED' && task.rejection_reason && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Revision Requested by Admin:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">"{task.rejection_reason}"</p>
                </div>
              )}

              {/* Submission Notes if submitted */}
              {task.status === 'SUBMITTED' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  <div className="font-bold">Awaiting Admin Approval</div>
                  <p className="text-[11px] mt-0.5">
                    Submission notes: "{task.submission_notes || 'Deliverables submitted.'}"
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Points will be awarded as soon as the administrator verifies your deliverables.
                  </p>
                </div>
              )}

              {/* Progress Slider & Actions */}
              {task.status !== 'APPROVED' && task.status !== 'COMPLETED' && (
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Progress slider */}
                  <div className="flex-1 max-w-sm w-full">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">My Work Progress:</span>
                      <span className="font-bold text-indigo-400">{task.progress_percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress_percentage}
                      onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-2">
                    {task.status === 'TO_DO' && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Task</span>
                      </button>
                    )}

                    {(task.status === 'IN_PROGRESS' || task.status === 'REJECTED' || task.status === 'TO_DO') && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setSubmissionNotes('');
                          setActualHours(String(task.estimated_hours || 8));
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{task.status === 'REJECTED' ? 'Resubmit Work' : 'Submit Deliverables'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submit Work Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Submit Deliverables for Review</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{selectedTask.title}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl leading-relaxed">
                ℹ️ <strong>Company Policy:</strong> Points are NOT awarded immediately upon submission. Once the administrator inspects and approves your deliverables, points (+10 base, +5 early delivery, +10 high priority) are awarded automatically.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Notes & Deliverable Links <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Completed all 14 screens in Figma. Prototype link: https://figma.com/file/... Ready for final review."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Screenshot / File Proof (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit to Admin for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
