import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { WorkReport } from '../../types';
import { RejectionModal } from '../../components/RejectionModal';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User as UserIcon,
  Calendar,
  Paperclip,
  Check,
  Sparkles,
} from 'lucide-react';

export const ReportsReview: React.FC = () => {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback] = useState('');

  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reportToReject, setReportToReject] = useState<WorkReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/reports', { params });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (report: WorkReport) => {
    try {
      await api.post(`/reports/${report.id}/approve`);
      setFeedback(`Daily report for ${report.user_name} approved! Awarded +2 points.`);
      loadReports();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve report');
    }
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!reportToReject) return;
    await api.post(`/reports/${reportToReject.id}/reject`, { rejection_reason: reason });
    setFeedback(`Report returned with feedback for revision.`);
    loadReports();
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Daily Work Reports Verification
          </h2>
          <p className="text-xs text-slate-400">
            Every submission requires admin review. Approved logs award +2 points to the member.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#111827] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-400">No daily work reports found.</div>
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className={`p-5 bg-[#111827] border rounded-2xl transition space-y-4 shadow-xl ${
                r.status === 'PENDING_APPROVAL'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : r.status === 'REJECTED'
                  ? 'border-red-500/30'
                  : 'border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {r.user_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{r.user_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({r.user_designation})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-3 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Date: <strong>{r.report_date}</strong></span>
                      </span>
                      {r.client_name && (
                        <span>Client: <strong className="text-indigo-300">{r.client_name}</strong></span>
                      )}
                      <span>Hours: <strong className="text-emerald-400">{r.hours_worked} hrs</strong></span>
                      <span>Progress: <strong className="text-cyan-400">{r.progress_percentage}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : r.status === 'REJECTED'
                        ? 'bg-red-500/15 text-red-300 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Work Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1">
                    1. What Did You Work On?
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{r.work_description}</p>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block mb-1">
                    2. What Did You Complete?
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {r.completed_items || 'No completed items explicitly specified.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide block mb-1">
                    3. What Did You Implement?
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {r.implemented_items || 'Standard implementation steps.'}
                  </p>
                </div>
              </div>

              {/* Rejection Note Display */}
              {r.status === 'REJECTED' && r.rejection_reason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                  <span className="font-bold">Rejection Feedback Provided:</span> {r.rejection_reason}
                </div>
              )}

              {/* Additional notes & attachments */}
              {r.additional_notes && (
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Additional Notes:</span> {r.additional_notes}
                </div>
              )}

              {r.attachments && r.attachments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Paperclip className="w-3 h-3" /> Deliverable Proofs:
                  </span>
                  {r.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-medium transition"
                    >
                      {a.file_name}
                    </a>
                  ))}
                </div>
              )}

              {/* Approval Buttons for Pending Reports */}
              {r.status === 'PENDING_APPROVAL' && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleApprove(r)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (+2 Points)</span>
                  </button>
                  <button
                    onClick={() => {
                      setReportToReject(r);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject with Feedback</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <RejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmRejection}
        title="Reject Daily Work Report"
        itemTitle={`Report for ${reportToReject?.report_date} by ${reportToReject?.user_name}`}
      />
    </div>
  );
};
