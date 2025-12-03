'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { applicationService } from '@/lib/applicationService';
import { Application } from '@/types';
import Loading from '@/components/Loading';
import { format } from 'date-fns';
import { FiEye } from 'react-icons/fi';
import Modal from '@/components/Modal';

export default function CandidateApplications() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadApplications();
    }
  }, [user, authLoading, router]);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
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

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-info';
      case 'reviewed':
        return 'badge-warning';
      case 'shortlisted':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of your job applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  filter === status
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status} ({applications.filter((a) => status === 'all' || a.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.applicationId} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {application.job?.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {application.job?.employer?.companyName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied on {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                      {application.status}
                    </span>
                    <button
                      onClick={() => setSelectedApp(application)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <FiEye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {application.job && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {application.job.requiredSkills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="badge bg-gray-100 text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No applications found</p>
            <button
              onClick={() => router.push('/candidate/jobs')}
              className="btn-primary mt-4"
            >
              Browse Available Jobs
            </button>
          </div>
        )}

        {/* Application Details Modal */}
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="Application Details"
          size="lg"
        >
          {selectedApp && selectedApp.job && (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedApp.job.title}</h3>
                <p className="text-gray-600 mt-1">{selectedApp.job.employer?.companyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Status:</span>
                  <span className={`ml-2 badge ${getStatusBadgeClass(selectedApp.status)}`}>
                    {selectedApp.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Applied:</span>
                  <span className="ml-2">
                    {format(new Date(selectedApp.appliedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Job Type:</span>
                  <span className="ml-2 capitalize">{selectedApp.job.jobType}</span>
                </div>
                <div>
                  <span className="font-semibold">Work Mode:</span>
                  <span className="ml-2 capitalize">{selectedApp.job.workMode}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-gray-700">{selectedApp.job.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.job.requiredSkills.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => setSelectedApp(null)} className="btn-secondary w-full">
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
