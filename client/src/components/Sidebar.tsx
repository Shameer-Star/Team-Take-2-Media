import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Settings,
  LogOut,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNav: NavItem[] = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/reports', label: 'Daily Reports', icon: FileText },
    { to: '/clients', label: 'Client CRM', icon: Building2 },
    { to: '/leads', label: 'Leads Pipeline', icon: TrendingUp },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/team', label: 'Team Management', icon: Users },
    { to: '/leaderboard', label: 'Leaderboard', icon: Award },
    { to: '/achievements', label: 'Badges & Awards', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/ai-insights', label: 'AI Insights', icon: Sparkles, badge: 'V1' },
    { to: '/audit-logs', label: 'Audit Trail', icon: ShieldCheck },
    { to: '/point-rules', label: 'Point Rules & Config', icon: Sliders },
  ];

  const memberNav: NavItem[] = [
    { to: '/member', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/submit-report', label: 'Daily Work Report', icon: FileText },
    { to: '/clients', label: 'Clients & Accounts', icon: Building2 },
    { to: '/leads', label: 'Leads CRM', icon: TrendingUp },
    { to: '/projects', label: 'My Projects', icon: Briefcase },
    { to: '/leaderboard', label: 'Company Leaderboard', icon: Award },
    { to: '/my-points', label: 'Points & Badges', icon: Sparkles },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : memberNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0F172A] border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/25 tracking-tighter">
              T2
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5">
                TAKE TWO OS
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                TEAM TAKE TWO MEDIA
              </div>
            </div>
          </div>
        </div>

        {/* User Summary Pill */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.designation || user?.role}</div>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isAdmin ? 'Admin' : `${user?.total_points ?? 0} Pts`}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="text-[11px] text-slate-400 italic mb-2 text-center">
            "One Workspace. One Team. Complete Control."
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
