'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { jobService } from '@/lib/jobService';
import { applicationService } from '@/lib/applicationService';
import { Job, Application } from '@/types';
import Loading from '@/components/Loading';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

export default function EmployerJobs() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'employer')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadJobs();
    }
  }, [user, authLoading, router]);

  const loadJobs = async () => {
    try {
      const data = await jobService.getMyJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      const apps = await applicationService.getApplicationsForJob(jobId);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleViewJob = async (job: Job) => {
    setSelectedJob(job);
    await loadApplications(job.jobId);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter((j) => j.jobId !== jobId));
      setShowDeleteConfirm(null);
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: any) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status);
      // Reload applications
      if (selectedJob) {
        await loadApplications(selectedJob.jobId);
      }
      alert('Application status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
          </div>
          <button
            onClick={() => router.push('/employer/post-job')}
            className="btn-primary"
          >
            Post New Job
          </button>
        </div>

        {/* Jobs Grid */}
        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                onClick={() => handleViewJob(job)}
                showActions
                onEdit={() => router.push(`/employer/edit-job/${job.jobId}`)}
                onDelete={() => setShowDeleteConfirm(job.jobId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No jobs posted yet</p>
            <button
              onClick={() => router.push('/employer/post-job')}
              className="btn-primary mt-4"
            >
              Post Your First Job
            </button>
          </div>
        )}

        {/* Job Details Modal */}
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title="Job Details & Applications"
          size="xl"
        >
          {selectedJob && (
            <div className="space-y-6">
              {/* Job Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h3>
                <p className="text-gray-700 mb-4">{selectedJob.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-semibold">Job Type:</span>
                    <span className="ml-2 capitalize">{selectedJob.jobType}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Work Mode:</span>
                    <span className="ml-2 capitalize">{selectedJob.workMode}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Experience:</span>
                    <span className="ml-2">{selectedJob.experienceRequired}+ years</span>
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>
                    <span className={`ml-2 badge ${selectedJob.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedJob.requiredSkills.map((skill, index) => (
                      <span key={index} className="badge badge-info">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applications */}
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  Applications ({applications.length})
                </h4>
                {applications.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {applications.map((app) => (
                      <div
                        key={app.applicationId}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {app.candidate?.name}
                            </p>
                            <p className="text-sm text-gray-600">{app.candidate?.email}</p>
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

                        {app.candidate && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {app.candidate.skills.slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="badge bg-gray-100 text-gray-700 text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {app.candidate?.cvUrl && (
                            <a
                              href={app.candidate.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs btn-secondary py-1 px-3"
                            >
                              View CV
                            </a>
                          )}
                          {app.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(app.applicationId, 'reviewed')}
                              className="text-xs btn-primary py-1 px-3"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {app.status === 'reviewed' && (
                            <button
                              onClick={() => handleUpdateStatus(app.applicationId, 'shortlisted')}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(app.applicationId, 'rejected')}
                              className="text-xs btn-danger py-1 px-3"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No applications yet</p>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => showDeleteConfirm && handleDeleteJob(showDeleteConfirm)}
                className="btn-danger flex-1"
              >
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
