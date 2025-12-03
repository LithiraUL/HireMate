'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { jobService } from '@/lib/jobService';
import { applicationService } from '@/lib/applicationService';
import { Job, Application } from '@/types';
import Loading from '@/components/Loading';
import { FiBriefcase, FiUsers, FiFileText, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function EmployerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'employer')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const jobsData = await jobService.getMyJobs();
      setJobs(jobsData);
      
      // Get all applications for all jobs
      const allApplications = await Promise.all(
        jobsData.map((job) => applicationService.getApplicationsForJob(job.jobId))
      );
      setApplications(allApplications.flat());
    } catch (error) {
      console.error('Error loading data:', error);
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

  const stats = [
    {
      title: 'Active Jobs',
      value: jobs.filter((j) => j.status === 'open').length,
      icon: FiBriefcase,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Applications',
      value: applications.length,
      icon: FiFileText,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Under Review',
      value: applications.filter((a) => a.status === 'reviewed').length,
      icon: FiUsers,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Shortlisted',
      value: applications.filter((a) => a.status === 'shortlisted').length,
      icon: FiCheckCircle,
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your job postings and candidates</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/employer/post-job"
                className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <h4 className="font-semibold text-primary-700">Post a New Job</h4>
                <p className="text-sm text-gray-600">Create a new job posting</p>
              </Link>
              <Link
                href="/employer/candidates"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-semibold text-gray-700">Find Candidates</h4>
                <p className="text-sm text-gray-600">Search and filter candidates</p>
              </Link>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Job Postings</h3>
            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.jobId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.status === 'open' ? 'Active' : 'Closed'}</p>
                  </div>
                  <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No jobs posted yet</p>
              )}
              {jobs.length > 3 && (
                <Link href="/employer/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium block text-center">
                  View all jobs →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        {applications.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.applicationId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.candidate?.name}</div>
                        <div className="text-sm text-gray-500">{app.candidate?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.job?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          app.status === 'shortlisted' ? 'badge-success' :
                          app.status === 'reviewed' ? 'badge-warning' :
                          app.status === 'rejected' ? 'badge-danger' : 'badge-info'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
