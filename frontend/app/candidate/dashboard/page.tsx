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

  const handleInterviewResponse = async (interviewId: string, status: 'confirmed' | 'declined') => {
    try {
      await interviewService.updateInterviewStatus(interviewId, status);
      alert(`Interview ${status === 'confirmed' ? 'confirmed' : 'declined'} successfully!`);
      loadData(); // Refresh interviews
    } catch (error) {
      console.error('Error updating interview status:', error);
      alert('Failed to update interview status. Please try again.');
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
      color: 'bg-primary-100 text-primary-700',
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
                <div key={app._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{app.job?.title}</p>
                    <p className="text-sm text-gray-600">{app.job?.employer?.companyName}</p>
                  </div>
                  <span
                    className={`badge ${
                      app.status === 'shortlisted'
                        ? 'bg-primary-100 text-primary-700'
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
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiCalendar className="text-primary-600" />
              Upcoming Interviews
            </h3>
            <div className="space-y-4">
              {interviews
                .filter((i) => i.status === 'scheduled' || i.status === 'confirmed')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((interview) => (
                  <div key={interview._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {interview.job?.title || 'Position Interview'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {interview.job?.employer?.companyName || 'Company'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="h-4 w-4 text-primary-600" />
                            {new Date(interview.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="font-medium">
                            {new Date(interview.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${
                        interview.status === 'confirmed' ? 'bg-primary-100 text-primary-700' :
                        interview.status === 'declined' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                    
                    {interview.meetingLink && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Join Meeting →
                        </a>
                      </div>
                    )}
                    
                    {interview.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {interview.notes}
                        </p>
                      </div>
                    )}
                    
                    {interview.status === 'scheduled' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                        <button
                          onClick={() => handleInterviewResponse(interview._id, 'confirmed')}
                          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          Confirm Attendance
                        </button>
                        <button
                          onClick={() => handleInterviewResponse(interview._id, 'declined')}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
