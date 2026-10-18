import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const location = useLocation();

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
          onOpenReportModal={() => window.location.href = '/submit-report'}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
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

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/member" replace />;
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
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Work & Business Routes */}
            <Route path="/admin" element={<ProtectedLayout><AdminRoute element={<AdminDashboard />} /></ProtectedLayout>} />
            <Route path="/tasks" element={<ProtectedLayout><AdminRoute element={<TaskManagement />} /></ProtectedLayout>} />
            <Route path="/reports" element={<ProtectedLayout><AdminRoute element={<ReportsReview />} /></ProtectedLayout>} />
            <Route path="/team" element={<ProtectedLayout><AdminRoute element={<TeamManagement />} /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><AdminRoute element={<AnalyticsDashboard />} /></ProtectedLayout>} />
            <Route path="/audit-logs" element={<ProtectedLayout><AdminRoute element={<AuditLogPage />} /></ProtectedLayout>} />

            {/* Member & Shared Business Routes */}
            <Route path="/member" element={<ProtectedLayout><MemberDashboard /></ProtectedLayout>} />
            <Route path="/my-tasks" element={<ProtectedLayout><MyTasks /></ProtectedLayout>} />
            <Route path="/submit-report" element={<ProtectedLayout><DailyReportSubmit /></ProtectedLayout>} />
            <Route path="/clients" element={<ProtectedLayout><ClientCRM /></ProtectedLayout>} />
            <Route path="/leads" element={<ProtectedLayout><LeadPipeline /></ProtectedLayout>} />
            <Route path="/projects" element={<ProtectedLayout><ProjectManagement /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><MyProfile /></ProtectedLayout>} />

            {/* Legacy Gamification Routes redirected to clean Business equivalents */}
            <Route path="/leaderboard" element={<Navigate to="/team" replace />} />
            <Route path="/achievements" element={<Navigate to="/tasks" replace />} />
            <Route path="/point-rules" element={<Navigate to="/admin" replace />} />
            <Route path="/my-points" element={<Navigate to="/my-tasks" replace />} />
            <Route path="/ai-insights" element={<Navigate to="/analytics" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
