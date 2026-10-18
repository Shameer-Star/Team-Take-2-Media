import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Menu, Plus, Check, Shield } from 'lucide-react';
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
    <header className="h-16 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            {title}
            {isAdmin && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E50914]/15 text-[#ff4d4f] border border-[#E50914]/30 flex items-center gap-1">
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
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#E50914]/25 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            )}
            {onOpenLeadModal && (
              <button
                onClick={onOpenLeadModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
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
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#E50914]/25 transition cursor-pointer"
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
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 relative transition cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#09090b]">
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f0f12] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-[#E50914]/20 text-[#ff4d4f] font-bold px-1.5 py-0.5 rounded">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-zinc-400 hover:text-white font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
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
                        className={`p-3 text-xs transition cursor-pointer hover:bg-zinc-800/50 flex items-start space-x-2.5 ${
                          n.is_read ? 'opacity-60' : 'bg-zinc-900/40'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            n.is_read ? 'bg-transparent' : 'bg-[#E50914]'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-zinc-200 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-zinc-400 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
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
          className="flex items-center space-x-2.5 pl-2 cursor-pointer hover:opacity-90 transition"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center border border-zinc-700 shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-zinc-100">{user?.name}</div>
            <div className="text-[10px] text-zinc-400">
              {isAdmin ? 'Administrator' : (user?.designation || 'Team Member')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
