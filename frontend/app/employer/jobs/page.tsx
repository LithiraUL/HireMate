'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { jobService } from '@/lib/jobService';
import { applicationService } from '@/lib/applicationService';
import { interviewService } from '@/lib/interviewService';
import { Job, Application } from '@/types';
import Loading from '@/components/Loading';
import JobCard from '@/components/JobCard';
import Modal from '@/components/Modal';
import { FiEdit, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';

// Helper functions for skill normalization matching the backend skillNormalizer.js
const normalizeSkill = (skill: string): string => {
  if (!skill) return '';
  const s = skill.toString().trim().toLowerCase();
  
  const aliases: Record<string, string> = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'html': 'HTML',
    'html5': 'HTML',
    'css': 'CSS',
    'css3': 'CSS',
    'react': 'React',
    'reactjs': 'React',
    'react.js': 'React',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'angular': 'Angular',
    'angularjs': 'Angular',
    'py': 'Python',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'cpp': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'php': 'PHP',
    'aws': 'AWS',
    'gcp': 'GCP',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'docker': 'Docker',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'git': 'Git',
    'github': 'GitHub',
    'ui': 'UI Design',
    'ux': 'UX Design',
    'ui/ux': 'UI/UX Design',
    'ml': 'Machine Learning',
    'ai': 'Artificial Intelligence',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'django': 'Django',
    'flask': 'Flask',
    'spring': 'Spring Boot',
    'springboot': 'Spring Boot',
    'ruby': 'Ruby',
    'rails': 'Ruby on Rails',
    'rubyonrails': 'Ruby on Rails'
  };

  if (aliases[s]) {
    return aliases[s];
  }

  return skill.trim().replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeSkillsArray = (skillsArray: string[]): string[] => {
  if (!Array.isArray(skillsArray)) return [];
  const normalized = skillsArray.map(normalizeSkill).filter(Boolean);
  return Array.from(new Set(normalized));
};

// Algorithmic compatibility calculator matching backend compatibilityEngine.js logic
const calculateAlgorithmicScore = (job: any, candidate: any, weights?: { skills: number, experience: number, preferences: number, education: number, age: number }): number => {
  if (!job || !candidate) return 0;

  // 1. Skills Overlap
  const combinedSkills = Array.from(new Set([
    ...(candidate.skills || []),
    ...(candidate.extractedSkills || [])
  ]));
  
  const jobRequiredSkills = job.requiredSkills || [];
  let skillScore = 100;
  if (jobRequiredSkills.length > 0) {
    const normalizedCandidateSkills = normalizeSkillsArray(combinedSkills);
    const normalizedJobSkills = normalizeSkillsArray(jobRequiredSkills);
    let matchCount = 0;
    normalizedJobSkills.forEach(skill => {
      if (normalizedCandidateSkills.includes(skill)) {
        matchCount++;
      }
    });
    skillScore = Math.round((matchCount / normalizedJobSkills.length) * 100);
  }

  // 2. Experience Overlap
  const requiredExp = job.experienceRequired || 0;
  let experienceScore = 100;
  if (requiredExp > 0) {
    const actualExp = candidate.experienceYears || 0;
    if (actualExp >= requiredExp) {
      experienceScore = 100;
    } else {
      experienceScore = Math.round((actualExp / requiredExp) * 100);
    }
  }

  // 3. Education Overlap
  let educationScore = 100;
  if (job.educationRequired) {
    if (!candidate.educationLevel) {
      educationScore = 0;
    } else {
      const req = job.educationRequired.toLowerCase();
      const actual = candidate.educationLevel.toLowerCase();
      if (actual.includes(req) || req.includes(actual)) {
        educationScore = 100;
      } else {
        educationScore = 50;
      }
    }
  }

  // 4. Preference Overlap
  const jobEmploymentType = job.employmentType || job.jobType;
  const jobWorkMode = job.workMode;
  
  const candidateEmploymentType = candidate.jobPreferences?.employmentType;
  const candidateWorkMode = candidate.jobPreferences?.workMode;
  
  let preferenceMatches = 0;
  if (
    !jobEmploymentType || 
    !candidateEmploymentType || 
    candidateEmploymentType === 'both' || 
    jobEmploymentType === candidateEmploymentType
  ) {
    preferenceMatches++;
  }
  
  if (
    !jobWorkMode || 
    !candidateWorkMode || 
    candidateWorkMode === 'any' || 
    jobWorkMode === candidateWorkMode
  ) {
    preferenceMatches++;
  }
  
  let preferenceScore = 0;
  if (preferenceMatches === 2) preferenceScore = 100;
  else if (preferenceMatches === 1) preferenceScore = 50;

  // 5. Age Overlap
  let ageScore = 100;
  if (job.ageRange && (job.ageRange.min || job.ageRange.max)) {
    if (!candidate.age) {
      ageScore = 0;
    } else {
      const age = candidate.age;
      const min = job.ageRange.min || 0;
      const max = job.ageRange.max || Infinity;
      if (age >= min && age <= max) {
        ageScore = 100;
      } else {
        ageScore = 0;
      }
    }
  }

  // Resolve weights
  let w = {
    skills: 40,
    experience: 25,
    preferences: 15,
    education: 10,
    age: 10
  };

  if (weights) {
    w = {
      skills: typeof weights.skills === 'number' ? weights.skills : 40,
      experience: typeof weights.experience === 'number' ? weights.experience : 25,
      preferences: typeof weights.preferences === 'number' ? weights.preferences : 15,
      education: typeof weights.education === 'number' ? weights.education : 10,
      age: typeof weights.age === 'number' ? weights.age : 10
    };

    const total = w.skills + w.experience + w.preferences + w.education + w.age;
    if (total !== 100 && total > 0) {
      w.skills = (w.skills / total) * 100;
      w.experience = (w.experience / total) * 100;
      w.preferences = (w.preferences / total) * 100;
      w.education = (w.education / total) * 100;
      w.age = (w.age / total) * 100;
    }
  }

  const finalScore = 
    (skillScore * (w.skills / 100)) + 
    (experienceScore * (w.experience / 100)) + 
    (educationScore * (w.education / 100)) + 
    (preferenceScore * (w.preferences / 100)) + 
    (ageScore * (w.age / 100));

  return Math.round(finalScore);
};

export default function EmployerJobs() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    meetingLink: '',
    notes: ''
  });

  const defaultWeights = {
    skills: 40,
    experience: 25,
    preferences: 15,
    education: 10,
    age: 10
  };
  const [weights, setWeights] = useState(defaultWeights);
  const [showSettings, setShowSettings] = useState(false);

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
    setWeights(defaultWeights);
    setShowSettings(false);
    setSelectedJob(job);
    await loadApplications(job._id);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter((j) => j._id !== jobId));
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
        await loadApplications(selectedJob._id);
      }
      alert('Application status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setShowInterviewModal(true);
    setInterviewData({ date: '', time: '', meetingLink: '', notes: '' });
  };

  const handleSubmitInterview = async () => {
    if (!selectedApplication || !selectedJob) return;

    if (!interviewData.date || !interviewData.time) {
      alert('Please select date and time');
      return;
    }

    try {
      await interviewService.scheduleInterview({
        applicationId: selectedApplication._id,
        date: interviewData.date,
        time: interviewData.time,
        mode: interviewData.meetingLink ? 'online' : 'onsite',
        meetingLink: interviewData.meetingLink,
        location: interviewData.meetingLink ? undefined : 'To be confirmed',
        notes: interviewData.notes
      });

      alert('Interview scheduled successfully! Email sent to candidate.');
      setShowInterviewModal(false);
      setSelectedApplication(null);
      setInterviewData({ date: '', time: '', meetingLink: '', notes: '' });
      if (selectedJob) {
        loadApplications(selectedJob._id); // Refresh applications
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
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
                key={job._id}
                job={job}
                onClick={() => handleViewJob(job)}
                showActions
                onDelete={() => setShowDeleteConfirm(job._id)}
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
          onClose={() => {
            setSelectedJob(null);
            setWeights(defaultWeights);
            setShowSettings(false);
          }}
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
                    <span className="ml-2 capitalize">{selectedJob.employmentType || selectedJob.jobType}</span>
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
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>Applicants ({applications.length})</span>
                    {applications.length > 0 && (
                      <span className="text-xs text-gray-500 font-normal hidden sm:inline">Sorted by Compatibility Score Descending</span>
                    )}
                  </h4>
                  {applications.length > 0 && (
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="btn-secondary flex items-center gap-1.5 text-xs py-1 px-3"
                    >
                      <FiEdit className="h-3 w-3" />
                      {showSettings ? 'Hide Weights' : 'Adjust Weights'}
                    </button>
                  )}
                </div>

                {showSettings && applications.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-sm font-semibold text-gray-700">Custom Match Weights</span>
                      <span className={`text-xs font-bold ${
                        (weights.skills + weights.experience + weights.preferences + weights.education + weights.age) === 100 
                          ? 'text-green-600' 
                          : 'text-red-500'
                      }`}>
                        Total: {weights.skills + weights.experience + weights.preferences + weights.education + weights.age}/100
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Skills (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weights.skills}
                          onChange={(e) => setWeights({ ...weights, skills: parseInt(e.target.value) || 0 })}
                          className="input-field py-1 px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Experience (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weights.experience}
                          onChange={(e) => setWeights({ ...weights, experience: parseInt(e.target.value) || 0 })}
                          className="input-field py-1 px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Preferences (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weights.preferences}
                          onChange={(e) => setWeights({ ...weights, preferences: parseInt(e.target.value) || 0 })}
                          className="input-field py-1 px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Education (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weights.education}
                          onChange={(e) => setWeights({ ...weights, education: parseInt(e.target.value) || 0 })}
                          className="input-field py-1 px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Age (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weights.age}
                          onChange={(e) => setWeights({ ...weights, age: parseInt(e.target.value) || 0 })}
                          className="input-field py-1 px-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-1.5 border-t border-gray-200">
                      <button
                        onClick={() => setWeights(defaultWeights)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Reset to Default
                      </button>
                    </div>
                    
                    {(weights.skills + weights.experience + weights.preferences + weights.education + weights.age) !== 100 && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">
                        * The total weight must sum to exactly 100 before scores can recalculate correctly.
                      </p>
                    )}
                  </div>
                )}
                {applications.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {[...applications].map((app) => {
                      const score = calculateAlgorithmicScore(selectedJob, app.candidate, weights);
                      return { app, score };
                    }).sort((a, b) => b.score - a.score)
                    .map(({ app, score }) => {
                      const recommendation = score >= 80 ? 'Strong Match' : (score >= 50 ? 'Moderate Match' : 'Weak Match');
                      
                      let badgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
                      if (recommendation === 'Strong Match') {
                        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      } else if (recommendation === 'Moderate Match') {
                        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                      } else if (recommendation === 'Weak Match') {
                        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      }

                      let progressColor = 'bg-gray-400';
                      if (score >= 80) progressColor = 'bg-emerald-500';
                      else if (score >= 50) progressColor = 'bg-amber-500';
                      else progressColor = 'bg-rose-500';

                      return (
                        <div
                          key={app._id}
                          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fadeIn"
                        >
                          <div className={`absolute top-0 left-0 right-0 h-1.5 ${progressColor}`} />

                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h5 className="font-bold text-gray-900 text-lg">
                                  {app.candidate?.name}
                                </h5>
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeColor}`}>
                                  {recommendation}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">{app.candidate?.email}</p>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                              <div className="text-right">
                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Match Score</span>
                                <span className={`text-2xl font-black ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {score}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Candidate Skills */}
                          {app.candidate && app.candidate.skills && app.candidate.skills.length > 0 && (
                            <div className="mb-4">
                              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Candidate Skills</span>
                              <div className="flex flex-wrap gap-1.5">
                                {app.candidate.skills.slice(0, 8).map((skill, idx) => (
                                  <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-md font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Section */}
                          <div className="flex flex-wrap gap-2.5 items-center pt-3 border-t border-gray-100 justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Application Status:</span>
                              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                                {app.status}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {app.candidate?.cvUrl && (
                                <a
                                  href={app.candidate.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs btn-secondary py-1.5 px-3 flex items-center gap-1 hover:bg-gray-100 font-medium rounded-lg"
                                >
                                  <FiEye className="text-gray-500" />
                                  View CV
                                </a>
                              )}
                              {app.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(app._id, 'reviewed')}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Mark Reviewed
                                </button>
                              )}
                              {app.status === 'reviewed' && (
                                <button
                                  onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Shortlist
                                </button>
                              )}
                              {app.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                  className="text-xs border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                              {(app.status === 'shortlisted' || app.status === 'reviewed') && (
                                <button
                                  onClick={() => handleScheduleInterview(app)}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                  <FiCalendar />
                                  Schedule Interview
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

        {/* Interview Scheduling Modal */}
        <Modal
          isOpen={showInterviewModal}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedApplication(null);
          }}
          title="Schedule Interview"
        >
          <div className="space-y-4">
            {selectedApplication && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">{selectedApplication.candidate?.name}</h4>
                <p className="text-sm text-gray-600">{selectedApplication.candidate?.email}</p>
                <p className="text-sm text-gray-600 mt-1">Job: {selectedJob?.title}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date *
              </label>
              <input
                type="date"
                value={interviewData.date}
                onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                className="input-field w-full"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Time *
              </label>
              <input
                type="time"
                value={interviewData.time}
                onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link (Zoom/Google Meet/Teams)
              </label>
              <input
                type="url"
                value={interviewData.meetingLink}
                onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                className="input-field w-full"
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={interviewData.notes}
                onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                className="input-field w-full"
                rows={3}
                placeholder="Additional information for the candidate..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitInterview}
                className="btn-primary flex-1"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setSelectedApplication(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
