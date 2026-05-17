import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; department: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  users: () => api.get('/auth/users'),
};

// Goals API
export const goalsApi = {
  getAll: (params?: { quarter?: string; year?: number; status?: string }) =>
    api.get('/goals', { params }),
  getById: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  submit: (id: string) => api.post(`/goals/${id}/submit`),
  submitAll: (quarter: string, year: number) => api.post('/goals/submit-all', { quarter, year }),
  unlock: (id: string) => api.post(`/goals/${id}/unlock`),
  checkIn: (id: string, data: { value: number; notes?: string }) =>
    api.post(`/goals/${id}/checkin`, data),
};

export const submitGoalApi = {
  submit: (id: string) => api.post(`/goals/${id}/submit`),
};

// Approvals API
export const approvalsApi = {
  getPending: () => api.get('/approvals/pending'),
  getHistory: (params?: { status?: string; quarter?: string; year?: number }) =>
    api.get('/approvals/history', { params }),
  approve: (id: string) => api.post(`/approvals/${id}/approve`),
  reject: (id: string, reason?: string) => api.post(`/approvals/${id}/reject`, { reason }),
  return: (id: string, feedback?: string) => api.post(`/approvals/${id}/return`, { feedback }),
};

// Analytics API
export const analyticsApi = {
  dashboard: (params?: { quarter?: string; year?: number }) =>
    api.get('/analytics/dashboard', { params }),
  trends: (year?: number) => api.get('/analytics/trends', { params: { year } }),
  departmentPerformance: (params?: { quarter?: string; year?: number }) =>
    api.get('/analytics/department-performance', { params }),
  thrustAreas: (params?: { quarter?: string; year?: number }) =>
    api.get('/analytics/thrust-areas', { params }),
  teamPerformance: () => api.get('/analytics/team-performance'),
  export: (params?: { quarter?: string; year?: number }) =>
    api.get('/analytics/export', { params, responseType: 'blob' }),
};

// Notifications API
export const notificationsApi = {
  getAll: (unreadOnly?: boolean) =>
    api.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Escalations API
export const escalationsApi = {
  getAll: (status?: string) => api.get('/escalations', { params: { status } }),
  create: (goalId: string, reason: string) =>
    api.post('/escalations', { goalId, reason }),
  resolve: (id: string, resolution?: string) =>
    api.put(`/escalations/${id}/resolve`, { resolution }),
  close: (id: string) => api.put(`/escalations/${id}/close`),
};

// Audit API
export const auditApi = {
  getAll: (params?: { entityType?: string; entityId?: string; userId?: string; limit?: number; offset?: number }) =>
    api.get('/audit', { params }),
  getEntityHistory: (type: string, id: string) => api.get(`/audit/entity/${type}/${id}`),
  getUserActivity: (userId: string) => api.get(`/audit/user/${userId}`),
};

// Admin API
export const adminApi = {
  getUsers: (params?: { role?: string; department?: string; search?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  updateUserManager: (id: string, managerId?: string) =>
    api.put(`/admin/users/${id}/manager`, { managerId }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (name: string, headId: string) =>
    api.post('/admin/departments', { name, headId }),
  getCycles: () => api.get('/admin/cycles'),
  createCycle: (data: any) => api.post('/admin/cycles', data),
  updateCycleStatus: (id: string, status: string) =>
    api.put(`/admin/cycles/${id}/status`, { status }),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, value: any) =>
    api.put('/admin/settings', { key, value }),
  getOverview: () => api.get('/admin/overview'),
};

// Shared Goals API
export const sharedGoalsApi = {
  getAll: (department?: string) => api.get('/shared-goals', { params: { department } }),
  getById: (id: string) => api.get(`/shared-goals/${id}`),
  create: (data: any) => api.post('/shared-goals', data),
  update: (id: string, data: any) => api.put(`/shared-goals/${id}`, data),
  delete: (id: string) => api.delete(`/shared-goals/${id}`),
  addContributors: (id: string, userIds: string[]) =>
    api.post(`/shared-goals/${id}/contributors`, { userIds }),
  updateProgress: (id: string, currentValue: number) =>
    api.put(`/shared-goals/${id}/progress`, { currentValue }),
};

// AI API
export const aiApi = {
  generateSMARTGoal: (vagueGoal: string, thrustArea?: string) =>
    api.post('/ai/generate-smart-goal', { vagueGoal, thrustArea }),
  answerQuestion: (question: string, context?: { userGoals?: any[]; userRole?: string }) =>
    api.post('/ai/answer', { question, context }),
  analyzeGoals: () => api.post('/ai/analyze-goals'),
};

export default api;