'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { jobService } from '@/lib/jobService';
import { applicationService } from '@/lib/applicationService';
import { Job } from '@/types';
import Loading from '@/components/Loading';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function CandidateJobs() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    workMode: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadJobs();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, filters, jobs]);

  const loadJobs = async () => {
    try {
      const data = await jobService.getAllJobs();
      setJobs(data.filter((job) => job.status === 'open'));
      setFilteredJobs(data.filter((job) => job.status === 'open'));
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.requiredSkills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter((job) => job.jobType === filters.jobType);
    }

    // Work mode filter
    if (filters.workMode) {
      filtered = filtered.filter((job) => job.workMode === filters.workMode);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    setApplying(true);
    try {
      await applicationService.applyForJob(selectedJob.jobId);
      alert('Application submitted successfully!');
      setSelectedJob(null);
    } catch (error: any) {
      console.error('Error applying for job:', error);
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">Find your next opportunity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by title, skills, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
            <div>
              <select
                value={filters.workMode}
                onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Work Modes</option>
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                onClick={() => setSelectedJob(job)}
                showActions
                onApply={() => setSelectedJob(job)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ jobType: '', workMode: '' });
              }}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Job Details Modal */}
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title="Job Details"
          size="lg"
        >
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                {selectedJob.employer && (
                  <p className="text-gray-600 mt-1">{selectedJob.employer.companyName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
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
                {selectedJob.salaryRange && (
                  <div>
                    <span className="font-semibold">Salary:</span>
                    <span className="ml-2">{selectedJob.salaryRange}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
                <button onClick={() => setSelectedJob(null)} className="btn-secondary flex-1">
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
