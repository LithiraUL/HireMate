'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/userService';
import { jobService } from '@/lib/jobService';
import { Candidate, FilterCriteria, Job } from '@/types';
import Loading from '@/components/Loading';
import CandidateCard from '@/components/CandidateCard';
import Modal from '@/components/Modal';
import { FiSearch, FiFilter, FiMail } from 'react-icons/fi';

export default function EmployerCandidates() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [positionTitle, setPositionTitle] = useState<string>('');
  const [invitationMessage, setInvitationMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    employmentType: undefined,
    workMode: undefined,
    ageMin: undefined,
    ageMax: undefined,
    skills: [],
  });

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
      const [candidatesData, jobsData] = await Promise.all([
        userService.searchCandidates({
          skills: searchTerm || undefined,
          minAge: filters.ageMin,
          maxAge: filters.ageMax,
          employmentType: filters.employmentType,
          workMode: filters.workMode,
        }),
        jobService.getMyJobs()
      ]);
      setCandidates(candidatesData);
      setFilteredCandidates(candidatesData);
      setJobs(jobsData.filter((j: Job) => j.status === 'open'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = candidates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (candidate.skills && candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }

    // Age filter
    if (filters.ageMin) {
      filtered = filtered.filter((c) => c.age && c.age >= filters.ageMin!);
    }
    if (filters.ageMax) {
      filtered = filtered.filter((c) => c.age && c.age <= filters.ageMax!);
    }

    // Employment type filter
    if (filters.employmentType && filters.employmentType !== 'both') {
      filtered = filtered.filter(
        (c) =>
          c.jobPreferences?.employmentType === filters.employmentType ||
          c.jobPreferences?.employmentType === 'both'
      );
    }

    // Work mode filter
    if (filters.workMode && filters.workMode !== 'any') {
      filtered = filtered.filter(
        (c) =>
          c.jobPreferences?.workMode === filters.workMode ||
          c.jobPreferences?.workMode === 'any'
      );
    }

    setFilteredCandidates(filtered);
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, searchTerm, filters]);

  const handleInviteToApply = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowInviteModal(true);
  };

  const sendInvitation = async () => {
    if (!selectedCandidate || !positionTitle.trim() || !selectedJobId) {
      alert('Please enter a position title and select a job posting');
      return;
    }
    
    try {
      await jobService.sendJobInvitation(selectedJobId, selectedCandidate._id, positionTitle.trim(), invitationMessage);
      alert(`Invitation sent successfully to ${selectedCandidate.name}!`);
      setShowInviteModal(false);
      setSelectedCandidate(null);
      setSelectedJobId('');
      setPositionTitle('');
      setInvitationMessage('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Talent Discovery</h1>
          <p className="text-gray-600 mt-2">
            Search and discover qualified candidates across the platform. Use advanced filters to find the perfect match for your open positions.
          </p>
          <div className="mt-4 bg-primary-50 border-l-4 border-primary-600 p-4">
            <p className="text-sm text-primary-700">
              <strong>Tip:</strong> This page shows ALL candidates on the platform, not just those who applied to your jobs. 
              To manage existing applicants, visit the <a href="/employer/jobs" className="underline font-medium">My Jobs</a> page.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Age
                </label>
                <input
                  type="number"
                  value={filters.ageMin || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, ageMin: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="input-field"
                  placeholder="18"
                  min="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Age
                </label>
                <input
                  type="number"
                  value={filters.ageMax || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, ageMax: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="input-field"
                  placeholder="65"
                  max="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={filters.employmentType || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, employmentType: e.target.value as any })
                  }
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode
                </label>
                <select
                  value={filters.workMode || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, workMode: e.target.value as any })
                  }
                  className="input-field"
                >
                  <option value="">All</option>
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div key={candidate._id} className="relative">
                <CandidateCard
                  candidate={candidate}
                  onClick={() => setSelectedCandidate(candidate)}
                  showActions
                  onViewProfile={() => setSelectedCandidate(candidate)}
                />
                <button
                  onClick={() => handleInviteToApply(candidate)}
                  className="absolute top-4 right-4 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 shadow-lg transition-colors z-10"
                  title="Invite to apply"
                >
                  <FiMail className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No candidates found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  employmentType: undefined,
                  workMode: undefined,
                  ageMin: undefined,
                  ageMax: undefined,
                  skills: [],
                });
              }}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Candidate Details Modal */}
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Candidate Profile"
          size="lg"
        >
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-3xl font-bold">
                  {selectedCandidate.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                  <p className="text-gray-600">{selectedCandidate.email}</p>
                  {selectedCandidate.age && (
                    <p className="text-sm text-gray-500">{selectedCandidate.age} years old</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Employment Preference</h4>
                  <p className="text-gray-700 capitalize">
                    {selectedCandidate.jobPreferences.employmentType}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Work Mode Preference</h4>
                  <p className="text-gray-700 capitalize">
                    {selectedCandidate.jobPreferences.workMode}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Documents & Links</h4>
                <div className="flex gap-3">
                  {selectedCandidate.cvUrl && (
                    <a
                      href={selectedCandidate.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      View CV
                    </a>
                  )}
                  {selectedCandidate.githubUrl && (
                    <a
                      href={selectedCandidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {selectedCandidate.linkedinUrl && (
                    <a
                      href={selectedCandidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => setSelectedCandidate(null)} className="btn-secondary w-full">
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Invite to Apply Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedCandidate(null);
            setSelectedJobId('');
            setPositionTitle('');
            setInvitationMessage('');
          }}
          title="Invite Candidate to Apply"
        >
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">{selectedCandidate.name}</h4>
                <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job Posting *
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    // Auto-fill position title when job is selected
                    const job = jobs.find(j => j._id === e.target.value);
                    if (job) setPositionTitle(job.title);
                  }}
                  className="input-field w-full"
                  required
                >
                  <option value="">Choose a job posting...</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} - {job.location}
                    </option>
                  ))}
                </select>
                {jobs.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    You don't have any open positions. Please create a job posting first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Title (Customizable) *
                </label>
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., Senior React Developer, Marketing Manager, etc."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from selected job. You can customize it if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="input-field w-full"
                  rows={4}
                  placeholder="Add a personalized message to the candidate explaining why you think they'd be a great fit for this position..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the invitation email
                </p>
              </div>

              <div className="bg-primary-50 border-l-4 border-primary-600 p-4">
                <p className="text-sm text-primary-700">
                  An invitation email will be sent to this candidate with details about the position 
                  and a link to apply directly.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendInvitation}
                  className="btn-primary flex-1"
                  disabled={!positionTitle.trim() || !selectedJobId || jobs.length === 0}
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedCandidate(null);
                    setSelectedJobId('');
                    setPositionTitle('');
                    setInvitationMessage('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
