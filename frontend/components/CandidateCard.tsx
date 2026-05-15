'use client';

import React from 'react';
import { Candidate } from '@/types';
import { FiMail, FiGithub, FiLinkedin, FiFileText } from 'react-icons/fi';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  showActions?: boolean;
  onViewProfile?: () => void;
  onScheduleInterview?: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onClick,
  showActions,
  onViewProfile,
  onScheduleInterview,
}) => {
  const matchScore = (candidate as any).compatibilityScore;

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div
      className="card cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4 pr-16">
            <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
            <div className="flex items-center flex-wrap gap-3 mt-1">
              <p className="text-sm text-gray-600 flex items-center break-all">
                <FiMail className="mr-1 flex-shrink-0" size={14} />
                <span className="truncate max-w-[140px]" title={candidate.email}>{candidate.email}</span>
              </p>
              {candidate.age && (
                <span className="badge badge-info whitespace-nowrap">{candidate.age} years</span>
              )}
            </div>
          </div>
        </div>
        
        {matchScore !== undefined && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border text-sm font-bold shadow-sm ${getMatchColor(matchScore)}`}>
            {matchScore}% Match
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 5).map((skill, index) => (
            <span key={index} className="badge bg-gray-100 text-gray-700">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="badge bg-gray-200 text-gray-600">
              +{candidate.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Job Preferences */}
      <div className="mb-4 text-sm text-gray-600">
        <p>
          <span className="font-semibold">Employment Type:</span>{' '}
          <span className="capitalize">{candidate.jobPreferences.employmentType}</span>
        </p>
        <p>
          <span className="font-semibold">Work Mode:</span>{' '}
          <span className="capitalize">{candidate.jobPreferences.workMode}</span>
        </p>
      </div>

      {/* Links */}
      <div className="flex gap-3 mb-4">
        {candidate.cvUrl && (
          <a
            href={candidate.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700"
            onClick={(e) => e.stopPropagation()}
          >
            <FiFileText size={20} />
          </a>
        )}
        {candidate.githubUrl && (
          <a
            href={candidate.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <FiGithub size={20} />
          </a>
        )}
        {candidate.linkedinUrl && (
          <a
            href={candidate.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
          >
            <FiLinkedin size={20} />
          </a>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          {onViewProfile && (
            <button onClick={onViewProfile} className="btn-secondary text-sm flex-1">
              View Profile
            </button>
          )}
          {onScheduleInterview && (
            <button onClick={onScheduleInterview} className="btn-primary text-sm flex-1">
              Schedule Interview
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
