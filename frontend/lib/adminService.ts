import api from './api';
import type { User, Job, Application } from '@/types';

interface SystemStats {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalInterviews: number;
  upcomingInterviews: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'job_posted' | 'application_submitted' | 'interview_scheduled';
  message: string;
  timestamp: Date;
  user?: string;
}

interface SystemLog {
  _id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'auth' | 'api' | 'database' | 'email' | 'system';
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
}

// Dashboard Stats
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  const response = await api.get('/admin/activity');
  return response.data.data;
};

// User Management
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data.data;
};

export const toggleUserStatus = async (userId: string): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}/toggle-status`);
  return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const updateUserRole = async (userId: string, role: 'candidate' | 'employer' | 'admin'): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data.data;
};

// Job Management
export const getAllJobsAdmin = async (): Promise<Job[]> => {
  const response = await api.get('/admin/jobs');
  return response.data.data;
};

export const toggleJobStatus = async (jobId: string): Promise<Job> => {
  const response = await api.put(`/admin/jobs/${jobId}/toggle-status`);
  return response.data.data;
};

export const deleteJobAdmin = async (jobId: string): Promise<void> => {
  await api.delete(`/admin/jobs/${jobId}`);
};

// Application Management
export const getAllApplicationsAdmin = async (): Promise<Application[]> => {
  const response = await api.get('/admin/applications');
  return response.data.data;
};

// System Logs
export const getSystemLogs = async (params?: {
  level?: string;
  category?: string;
  limit?: number;
}): Promise<SystemLog[]> => {
  const response = await api.get('/admin/logs', { params });
  return response.data.data;
};

export const clearOldLogs = async (daysOld: number): Promise<{ deletedCount: number }> => {
  const response = await api.delete('/admin/logs/clear', {
    data: { daysOld }
  });
  return response.data.data;
};

// System Health
export const getSystemHealth = async (): Promise<{
  api: { status: string; uptime: number };
  database: { status: string; responseTime: number };
  email: { status: string };
}> => {
  const response = await api.get('/admin/health');
  return response.data.data;
};

const adminService = {
  // Stats
  getSystemStats,
  getRecentActivity,
  
  // Users
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  updateUserRole,
  
  // Jobs
  getAllJobsAdmin,
  toggleJobStatus,
  deleteJobAdmin,
  
  // Applications
  getAllApplicationsAdmin,
  
  // Logs
  getSystemLogs,
  clearOldLogs,
  
  // Health
  getSystemHealth
};

export default adminService;
