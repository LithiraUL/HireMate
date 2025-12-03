'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { FiUsers, FiBriefcase, FiFileText, FiCalendar, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { getSystemStats, getRecentActivity } from '@/lib/adminService';

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

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalInterviews: 0,
    upcomingInterviews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
        return;
      }
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        getSystemStats(),
        getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <FiUsers className="text-blue-500" />;
      case 'job_posted':
        return <FiBriefcase className="text-green-500" />;
      case 'application_submitted':
        return <FiFileText className="text-purple-500" />;
      case 'interview_scheduled':
        return <FiCalendar className="text-orange-500" />;
      default:
        return <FiActivity className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalCandidates} candidates, {stats.totalEmployers} employers
                </p>
              </div>
              <FiUsers className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                <p className="text-xs text-green-600 mt-1">{stats.activeJobs} active</p>
              </div>
              <FiBriefcase className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-xs text-orange-600 mt-1">{stats.pendingApplications} pending</p>
              </div>
              <FiFileText className="text-4xl text-purple-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.upcomingInterviews} upcoming</p>
              </div>
              <FiCalendar className="text-4xl text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <FiActivity className="text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <FiUsers />
                  <span>Manage Users</span>
                </button>

                <button
                  onClick={() => router.push('/admin/jobs')}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <FiBriefcase />
                  <span>Manage Jobs</span>
                </button>

                <button
                  onClick={() => router.push('/admin/applications')}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <FiFileText />
                  <span>Review Applications</span>
                </button>

                <button
                  onClick={() => router.push('/admin/logs')}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <FiAlertCircle />
                  <span>System Logs</span>
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="card mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">API Status</span>
                    <span className="text-green-600 font-semibold">Operational</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600 font-semibold">Connected</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Email Service</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
