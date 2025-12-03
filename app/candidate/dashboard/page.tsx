'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { applicationService } from '@/lib/applicationService';
import { interviewService } from '@/lib/interviewService';
import { Application, Interview } from '@/types';
import Loading from '@/components/Loading';
import { FiBriefcase, FiCalendar, FiFileText, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function CandidateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [appsData, interviewsData] = await Promise.all([
        applicationService.getMyApplications(),
        interviewService.getMyInterviews(),
      ]);
      setApplications(appsData);
      setInterviews(interviewsData);
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
      title: 'Total Applications',
      value: applications.length,
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Under Review',
      value: applications.filter((a) => a.status === 'reviewed').length,
      icon: FiBriefcase,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Shortlisted',
      value: applications.filter((a) => a.status === 'shortlisted').length,
      icon: FiCheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Upcoming Interviews',
      value: interviews.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length,
      icon: FiCalendar,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Track your applications and manage your job search</p>
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
                href="/candidate/jobs"
                className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <h4 className="font-semibold text-primary-700">Browse Available Jobs</h4>
                <p className="text-sm text-gray-600">Find your next opportunity</p>
              </Link>
              <Link
                href="/candidate/profile"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h4 className="font-semibold text-gray-700">Update Your Profile</h4>
                <p className="text-sm text-gray-600">Keep your information current</p>
              </Link>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.applicationId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{app.job?.title}</p>
                    <p className="text-sm text-gray-600">{app.job?.employer?.companyName}</p>
                  </div>
                  <span
                    className={`badge ${
                      app.status === 'shortlisted'
                        ? 'badge-success'
                        : app.status === 'reviewed'
                        ? 'badge-warning'
                        : app.status === 'rejected'
                        ? 'badge-danger'
                        : 'badge-info'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
              {applications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No applications yet</p>
              )}
              {applications.length > 3 && (
                <Link href="/candidate/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium block text-center">
                  View all applications →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        {interviews.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Upcoming Interviews</h3>
            <div className="space-y-4">
              {interviews
                .filter((i) => i.status === 'scheduled' || i.status === 'confirmed')
                .map((interview) => (
                  <div key={interview.interviewId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FiCalendar className="text-primary-600 mr-3 h-5 w-5" />
                      <div>
                        <p className="font-medium text-gray-900">Interview Scheduled</p>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.date).toLocaleDateString()} at {interview.time}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${interview.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {interview.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
