'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiFilter } from 'react-icons/fi';
import { getSystemLogs } from '@/lib/adminService';

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

export default function SystemLogs() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [levelFilter, setLevelFilter] = useState<'all' | SystemLog['level']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SystemLog['category']>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
        return;
      }
      fetchLogs();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterLogs();
  }, [logs, levelFilter, categoryFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getSystemLogs({ limit: 50 });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // Set empty array on error so UI shows "No logs found"
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level: SystemLog['level']) => {
    switch (level) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'info':
        return <FiInfo className="text-blue-500" />;
      case 'warning':
        return <FiAlertCircle className="text-orange-500" />;
      case 'error':
        return <FiXCircle className="text-red-500" />;
    }
  };

  const getLevelBadgeColor = (level: SystemLog['level']) => {
    switch (level) {
      case 'success': return 'badge-success';
      case 'info': return 'badge-info';
      case 'warning': return 'badge-warning';
      case 'error': return 'badge-danger';
    }
  };

  const getCategoryBadgeColor = (category: SystemLog['category']) => {
    switch (category) {
      case 'auth': return 'badge-info';
      case 'api': return 'badge-success';
      case 'database': return 'badge-warning';
      case 'email': return 'badge';
      case 'system': return 'badge';
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
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="mt-2 text-gray-600">Monitor system activities and events</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="all">All Levels</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="all">All Categories</option>
                <option value="auth">Authentication</option>
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="email">Email</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="card text-center py-12">
              <FiActivity className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getLevelBadgeColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className={`badge ${getCategoryBadgeColor(log.category)}`}>
                          {log.category}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">{log.message}</h3>
                    
                    {log.details && (
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    )}

                    {log.userName && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>User:</span>
                        <span className="font-medium text-gray-700">{log.userName}</span>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
