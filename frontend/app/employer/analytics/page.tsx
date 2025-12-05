'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { analyticsService } from '@/lib/analyticsService';
import Loading from '@/components/Loading';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiClock, FiUsers, FiBarChart2 } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1month' | '3months' | '6months' | '1year'>('6months');
  const [hiringTrends, setHiringTrends] = useState<any[]>([]);
  const [timeToHire, setTimeToHire] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'employer' && user.role !== 'admin'))) {
      router.push('/login');
      return;
    }

    if (user) {
      loadAnalytics();
    }
  }, [user, authLoading, router, period]);

  const loadAnalytics = async () => {
    try {
      console.log('Loading analytics data...');
      const [trendsData, timeData, demoData] = await Promise.all([
        analyticsService.getHiringTrends(period),
        analyticsService.getTimeToHire(),
        analyticsService.getDemographics(),
      ]);
      console.log('Analytics loaded:', { trendsData, timeData, demoData });
      setHiringTrends(trendsData);
      setTimeToHire(timeData);
      setDemographics(demoData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to load analytics data. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiBarChart2 className="text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Track hiring performance and applicant insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-900">{demographics?.totalApplicants || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUsers className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Time to Hire</p>
                <p className="text-3xl font-bold text-gray-900">{timeToHire?.overallAverage || 0}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiClock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Positions</p>
                <p className="text-3xl font-bold text-gray-900">{timeToHire?.jobMetrics?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiTrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Top Skills Found</p>
                <p className="text-3xl font-bold text-gray-900">{demographics?.topSkills?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiBarChart2 className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Trends Chart */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Hiring Trends</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          {hiringTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hiringTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Applications" />
                <Line type="monotone" dataKey="shortlisted" stroke="#10b981" strokeWidth={2} name="Shortlisted" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No trend data available for this period</p>
          )}
        </div>

        {/* Demographics Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Age Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Age Distribution</h2>
            {demographics?.ageDistribution && demographics.ageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographics.ageDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {demographics.ageDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No age data available</p>
            )}
          </div>

          {/* Experience Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Experience Levels</h2>
            {demographics?.experienceDistribution && demographics.experienceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographics.experienceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No experience data available</p>
            )}
          </div>
        </div>

        {/* Top Skills */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Skills in Applicant Pool</h2>
          {demographics?.topSkills && demographics.topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographics.topSkills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No skills data available</p>
          )}
        </div>

        {/* Time to Hire by Job */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Time to Hire by Position</h2>
          {timeToHire?.jobMetrics && timeToHire.jobMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Days to Hire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeToHire.jobMetrics.map((job: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.jobTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.applicants}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.avgDays} days
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(job.postedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hiring data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
