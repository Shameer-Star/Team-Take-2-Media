import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Menu, Plus, Check, ExternalLink, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  onOpenTaskModal?: () => void;
  onOpenReportModal?: () => void;
  onOpenLeadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title = 'Overview',
  onOpenTaskModal,
  onOpenReportModal,
  onOpenLeadModal,
}) => {
  const { user, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title}
            {isAdmin && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin Mode
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right: Quick Actions & Notification Bell */}
      <div className="flex items-center space-x-3">
        {/* Quick Action Button */}
        {isAdmin ? (
          <div className="hidden sm:flex items-center space-x-2">
            {onOpenTaskModal && (
              <button
                onClick={onOpenTaskModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            )}
            {onOpenLeadModal && (
              <button
                onClick={onOpenLeadModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead</span>
              </button>
            )}
          </div>
        ) : (
          onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daily Report</span>
            </button>
          )
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 relative transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0B0F19]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifs(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link_url) {
                            navigate(n.link_url);
                            setShowNotifs(false);
                          }
                        }}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/50 flex items-start space-x-2.5 ${
                          n.is_read ? 'opacity-60' : 'bg-indigo-500/5'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            n.is_read ? 'bg-transparent' : 'bg-indigo-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => navigate(isAdmin ? '/team' : '/profile')}
          className="flex items-center space-x-2.5 pl-2 cursor-pointer hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/30 shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-200">{user?.name}</div>
            <div className="text-[10px] text-slate-400">
              {isAdmin ? 'Administrator' : `${user?.total_points ?? 0} Pts (${user?.performance_percentage ?? 0}%)`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
