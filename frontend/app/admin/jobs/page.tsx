'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import JobCard from '@/components/JobCard';
import { FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import type { Job } from '@/types';
import { getAllJobsAdmin, toggleJobStatus, deleteJobAdmin } from '@/lib/adminService';

export default function ManageJobs() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'on-hold'>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<'all' | 'full-time' | 'part-time' | 'contract'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
        return;
      }
      fetchJobs();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter, jobTypeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobsAdmin();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (job.postedBy?.companyName && 
          job.postedBy.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.jobType === jobTypeFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      const updatedJob = await toggleJobStatus(jobId);
      setJobs(jobs.map(job =>
        job._id === jobId ? updatedJob : job
      ));
    } catch (error) {
      console.error('Failed to toggle job status:', error);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    try {
      await deleteJobAdmin(selectedJob._id);
      setJobs(jobs.filter(job => job._id !== selectedJob._id));
      setShowDeleteModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="mt-2 text-gray-600">View and manage all job postings</p>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, skills, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value as any)}
                className="input-field w-full"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No jobs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="relative">
                <JobCard job={job} />
                
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => handleToggleStatus(job._id)}
                    className={`p-2 rounded-full ${
                      job.status === 'open'
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={job.status === 'open' ? 'Close Job' : 'Open Job'}
                  >
                    {job.status === 'open' ? <FiXCircle /> : <FiCheckCircle />}
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full shadow-sm text-sm">
                  <span className="font-semibold text-gray-900">{job.applicationsCount || 0}</span>
                  <span className="text-gray-500 ml-1">applications</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the job <strong>{selectedJob?.title}</strong>? 
            This will also delete all associated applications.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteJob}
              className="btn-danger"
            >
              Delete Job
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
