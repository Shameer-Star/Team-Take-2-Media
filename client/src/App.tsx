import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { LeadModal } from './components/LeadModal';

// Work & Business Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TeamManagement } from './pages/admin/TeamManagement';
import { TaskManagement } from './pages/admin/TaskManagement';
import { ReportsReview } from './pages/admin/ReportsReview';
import { ClientCRM } from './pages/admin/ClientCRM';
import { LeadPipeline } from './pages/admin/LeadPipeline';
import { ProjectManagement } from './pages/admin/ProjectManagement';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { AuditLogPage } from './pages/admin/AuditLogPage';

import { MemberDashboard } from './pages/member/MemberDashboard';
import { MyTasks } from './pages/member/MyTasks';
import { DailyReportSubmit } from './pages/member/DailyReportSubmit';
import { MyProfile } from './pages/member/MyProfile';

// Robust Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('COCO MEDIA OS caught render exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#0e0e11] border border-zinc-800 p-8 rounded-2xl shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#E50914] font-black text-xl">!</span>
            </div>
            <h1 className="text-lg font-black tracking-tight mb-2">Session Interrupted</h1>
            <p className="text-xs text-zinc-400 mb-6">
              A temporary interface issue occurred. Click below to refresh your workspace session.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="w-full py-2.5 px-4 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Recover Workspace Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine current page title
  let pageTitle = 'Executive Dashboard';
  const path = location.pathname;
  if (path.includes('/tasks') || path.includes('/my-tasks')) pageTitle = 'Task Management';
  else if (path.includes('/reports') || path.includes('/submit-report')) pageTitle = 'Daily Work Reports';
  else if (path.includes('/clients')) pageTitle = 'Client CRM & Accounts';
  else if (path.includes('/leads')) pageTitle = 'Sales CRM Pipeline';
  else if (path.includes('/projects')) pageTitle = 'Project Management';
  else if (path.includes('/team')) pageTitle = 'Team Directory';
  else if (path.includes('/analytics')) pageTitle = 'Business Analytics';
  else if (path.includes('/audit-logs')) pageTitle = 'Audit Trail';
  else if (path.includes('/profile')) pageTitle = 'Profile & Security';
  else if (path.includes('/member')) pageTitle = 'My Work Dashboard';

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={pageTitle}
          onOpenTaskModal={() => setTaskModalOpen(true)}
          onOpenLeadModal={() => setLeadModalOpen(true)}
          onOpenReportModal={() => navigate('/submit-report')}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      {isAdmin && (
        <>
          <TaskModal
            isOpen={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
            onSuccess={() => window.location.reload()}
          />
          <LeadModal
            isOpen={leadModalOpen}
            onClose={() => setLeadModalOpen(false)}
            onSuccess={() => window.location.reload()}
          />
        </>
      )}
    </div>
  );
};

// Strict Admin-only guard
const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/member" replace />;
  }
  return element;
};

// Strict Member guard
const MemberRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/member" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Root Dispatcher */}
              <Route path="/" element={<RootRedirect />} />

              {/* Admin-Only Work & Business Routes */}
              <Route path="/admin" element={<ProtectedLayout><AdminRoute element={<AdminDashboard />} /></ProtectedLayout>} />
              <Route path="/tasks" element={<ProtectedLayout><AdminRoute element={<TaskManagement />} /></ProtectedLayout>} />
              <Route path="/reports" element={<ProtectedLayout><AdminRoute element={<ReportsReview />} /></ProtectedLayout>} />
              <Route path="/team" element={<ProtectedLayout><AdminRoute element={<TeamManagement />} /></ProtectedLayout>} />
              <Route path="/analytics" element={<ProtectedLayout><AdminRoute element={<AnalyticsDashboard />} /></ProtectedLayout>} />
              <Route path="/audit-logs" element={<ProtectedLayout><AdminRoute element={<AuditLogPage />} /></ProtectedLayout>} />

              {/* Member-Accessible Business Routes */}
              <Route path="/member" element={<ProtectedLayout><MemberRoute element={<MemberDashboard />} /></ProtectedLayout>} />
              <Route path="/my-tasks" element={<ProtectedLayout><MemberRoute element={<MyTasks />} /></ProtectedLayout>} />
              <Route path="/submit-report" element={<ProtectedLayout><MemberRoute element={<DailyReportSubmit />} /></ProtectedLayout>} />
              <Route path="/clients" element={<ProtectedLayout><MemberRoute element={<ClientCRM />} /></ProtectedLayout>} />
              <Route path="/leads" element={<ProtectedLayout><MemberRoute element={<LeadPipeline />} /></ProtectedLayout>} />
              <Route path="/projects" element={<ProtectedLayout><MemberRoute element={<ProjectManagement />} /></ProtectedLayout>} />
              <Route path="/profile" element={<ProtectedLayout><MemberRoute element={<MyProfile />} /></ProtectedLayout>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
