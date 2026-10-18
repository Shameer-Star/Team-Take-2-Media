import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CocoLogo } from './CocoLogo';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
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

  // Pure Business & Work-based navigation
  const adminNav: NavItem[] = [
    { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/reports', label: 'Daily Work Reports', icon: FileText },
    { to: '/projects', label: 'Projects & Milestones', icon: Briefcase },
    { to: '/clients', label: 'Client CRM', icon: Building2 },
    { to: '/leads', label: 'Sales CRM Pipeline', icon: TrendingUp },
    { to: '/team', label: 'Team Directory', icon: Users },
    { to: '/analytics', label: 'Business Analytics', icon: BarChart3 },
    { to: '/audit-logs', label: 'Audit Trail', icon: ShieldCheck },
  ];

  const memberNav: NavItem[] = [
    { to: '/member', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/submit-report', label: 'Submit Daily Report', icon: FileText },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/clients', label: 'Clients & Accounts', icon: Building2 },
    { to: '/leads', label: 'Sales Leads', icon: TrendingUp },
    { to: '/profile', label: 'Profile & Security', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : memberNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#09090b] border-r border-zinc-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <CocoLogo variant="horizontal" size="sm" theme="dark" />
        </div>

        {/* User Summary Pill */}
        <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1">
                {user?.name}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">{user?.designation || (isAdmin ? 'Administrator' : 'Team Member')}</div>
            </div>
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
              isAdmin
                ? 'bg-[#E50914]/15 text-[#ff4d4f] border border-[#E50914]/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Work Operations
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#E50914] text-white font-bold shadow-md shadow-[#E50914]/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="text-[10px] text-zinc-500 italic mb-2 text-center font-medium">
            COCO MEDIA • Business OS
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#E50914]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
