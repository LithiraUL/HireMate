'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { candidateService } from '@/lib/candidateService';
import { Candidate, FilterCriteria } from '@/types';
import Loading from '@/components/Loading';
import CandidateCard from '@/components/CandidateCard';
import Modal from '@/components/Modal';
import { FiSearch, FiFilter } from 'react-icons/fi';

export default function EmployerCandidates() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
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
      loadCandidates();
    }
  }, [user, authLoading, router]);

  const loadCandidates = async () => {
    try {
      const data = await candidateService.getAllCandidates();
      setCandidates(data);
      setFilteredCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
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
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
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
          c.jobPreferences.employmentType === filters.employmentType ||
          c.jobPreferences.employmentType === 'both'
      );
    }

    // Work mode filter
    if (filters.workMode && filters.workMode !== 'any') {
      filtered = filtered.filter(
        (c) =>
          c.jobPreferences.workMode === filters.workMode ||
          c.jobPreferences.workMode === 'any'
      );
    }

    setFilteredCandidates(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, candidates]);

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
          <h1 className="text-3xl font-bold text-gray-900">Find Candidates</h1>
          <p className="text-gray-600 mt-2">Search and filter qualified candidates</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
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
              <CandidateCard
                key={candidate.userId}
                candidate={candidate}
                onClick={() => setSelectedCandidate(candidate)}
                showActions
                onViewProfile={() => setSelectedCandidate(candidate)}
              />
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
      </div>
    </div>
  );
}
