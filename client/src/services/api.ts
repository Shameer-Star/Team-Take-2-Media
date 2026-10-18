import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { mockStore, SEED_USERS, VALID_CREDENTIALS } from './mockData';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('coco_token') || localStorage.getItem('take_two_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Helper to get active authenticated user
function getCurrentUser(): any {
  try {
    const raw = localStorage.getItem('coco_user') || localStorage.getItem('take_two_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Mock Handler for fail-safe Vercel deployment and standalone demo
function handleMockRoute(url: string, method: string, data?: any): any {
  const cleanUrl = url.replace(/^\/api/, '');
  const currentUser = getCurrentUser();

  // Auth: Login - STRICT CREDENTIAL VERIFICATION
  if (cleanUrl.startsWith('/auth/login') && method === 'post') {
    const email = (data?.email || '').trim().toLowerCase();
    const password = data?.password || '';

    const entry = VALID_CREDENTIALS[email];
    if (!entry || entry.pass !== password) {
      return {
        __isError: true,
        status: 401,
        message: 'Invalid work email or password. Access is restricted to registered company accounts.',
      };
    }

    const matchedUser = {
      ...entry.user,
      role: entry.user.role === 'admin' ? 'admin' : 'team_member',
    };

    return {
      token: `coco-token-${matchedUser.id}`,
      user: matchedUser,
    };
  }

  // Auth: Me
  if (cleanUrl.startsWith('/auth/me')) {
    if (currentUser) return currentUser;
    return {
      __isError: true,
      status: 401,
      message: 'Unauthenticated session',
    };
  }

  // Analytics: Admin
  if (cleanUrl.startsWith('/analytics/admin')) {
    return mockStore.getAdminAnalytics();
  }

  // Tasks
  if (cleanUrl === '/tasks' || cleanUrl.startsWith('/tasks?')) {
    if (method === 'get') {
      // Team members only see their assigned tasks
      if (currentUser && currentUser.role !== 'admin') {
        return mockStore.tasks.filter(
          t => t.assigned_to_id === currentUser.id || 
               t.assigned_to_name?.toLowerCase() === currentUser.name?.toLowerCase()
        );
      }
      return [...mockStore.tasks];
    }
    if (method === 'post') {
      const newTask = {
        id: `t-${Date.now()}`,
        status: 'TO_DO',
        progress_percentage: 0,
        ...data,
      };
      mockStore.tasks.unshift(newTask);
      mockStore.save();
      return newTask;
    }
  }

  if (cleanUrl.match(/\/tasks\/[^\/]+/) && method === 'put') {
    const id = cleanUrl.split('/')[2];
    const index = mockStore.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      mockStore.tasks[index] = { ...mockStore.tasks[index], ...data };
      mockStore.save();
      return mockStore.tasks[index];
    }
  }

  // Reports
  if (cleanUrl === '/reports' || cleanUrl.startsWith('/reports?')) {
    if (method === 'get') {
      // Team members only see their own work reports
      if (currentUser && currentUser.role !== 'admin') {
        return mockStore.reports.filter(
          r => r.user_id === currentUser.id || 
               r.user_name?.toLowerCase() === currentUser.name?.toLowerCase()
        );
      }
      return [...mockStore.reports];
    }
    if (method === 'post') {
      const newReport = {
        id: `r-${Date.now()}`,
        status: 'PENDING_APPROVAL',
        report_date: new Date().toISOString().split('T')[0],
        ...data,
      };
      mockStore.reports.unshift(newReport);
      mockStore.save();
      return newReport;
    }
  }

  if (cleanUrl.match(/\/reports\/[^\/]+/) && method === 'put') {
    const id = cleanUrl.split('/')[2];
    const index = mockStore.reports.findIndex(r => r.id === id);
    if (index !== -1) {
      mockStore.reports[index] = { ...mockStore.reports[index], ...data };
      mockStore.save();
      return mockStore.reports[index];
    }
  }

  // Clients
  if (cleanUrl === '/clients') {
    if (method === 'get') return [...mockStore.clients];
    if (method === 'post') {
      const newClient = {
        id: `c-${Date.now()}`,
        status: 'Active',
        ...data,
      };
      mockStore.clients.unshift(newClient);
      mockStore.save();
      return newClient;
    }
  }

  // Leads
  if (cleanUrl === '/leads') {
    if (method === 'get') return [...mockStore.leads];
    if (method === 'post') {
      const newLead = {
        id: `l-${Date.now()}`,
        stage: 'NEW_LEAD',
        ...data,
      };
      mockStore.leads.unshift(newLead);
      mockStore.save();
      return newLead;
    }
  }

  if (cleanUrl.match(/\/leads\/[^\/]+/) && method === 'put') {
    const id = cleanUrl.split('/')[2];
    const index = mockStore.leads.findIndex(l => l.id === id);
    if (index !== -1) {
      mockStore.leads[index] = { ...mockStore.leads[index], ...data };
      mockStore.save();
      return mockStore.leads[index];
    }
  }

  // Projects
  if (cleanUrl === '/projects') {
    if (method === 'get') return [...mockStore.projects];
    if (method === 'post') {
      const newProj = {
        id: `p-${Date.now()}`,
        status: 'Planning',
        progress_percentage: 0,
        ...data,
      };
      mockStore.projects.unshift(newProj);
      mockStore.save();
      return newProj;
    }
  }

  // Users
  if (cleanUrl === '/users') {
    return [...mockStore.users];
  }

  // Notifications
  if (cleanUrl.startsWith('/notifications')) {
    if (cleanUrl.includes('/read-all') || method === 'put') {
      mockStore.notifications.forEach(n => (n.is_read = 1));
      mockStore.save();
      return { success: true };
    }
    return [...mockStore.notifications];
  }

  // Audit Logs
  if (cleanUrl.startsWith('/audit-logs')) {
    return [...mockStore.auditLogs];
  }

  // Achievements/Badges mock for legacy calls
  if (cleanUrl.startsWith('/achievements')) {
    return [];
  }

  return [];
}

api.interceptors.response.use(
  (response) => {
    // Detect if Vercel SPA rewrite returned HTML string instead of JSON
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html') || response.data.includes('<html'))
    ) {
      const url = response.config.url || '';
      const method = (response.config.method || 'get').toLowerCase();
      let requestData = response.config.data;
      try {
        if (typeof requestData === 'string') requestData = JSON.parse(requestData);
      } catch (e) {}

      const mockResult = handleMockRoute(url, method, requestData);
      if (mockResult && mockResult.__isError) {
        const error: any = new Error(mockResult.message || 'Unauthorized');
        error.response = { status: mockResult.status || 401, data: { error: mockResult.message } };
        return Promise.reject(error);
      }
      response.data = mockResult;
    }
    return response;
  },
  (error) => {
    const { config } = error;
    if (config) {
      const url = config.url || '';
      const method = (config.method || 'get').toLowerCase();
      let requestData = null;
      try {
        if (config.data) {
          requestData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        }
      } catch (e) {
        requestData = config.data;
      }

      const mockResult = handleMockRoute(url, method, requestData);
      if (mockResult && mockResult.__isError) {
        error.response = { status: mockResult.status || 401, data: { error: mockResult.message } };
        return Promise.reject(error);
      }

      // Return synthetic success response with mock data
      const syntheticResponse: AxiosResponse = {
        data: mockResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.resolve(syntheticResponse);
    }
    return Promise.reject(error);
  }
);

export default api;
