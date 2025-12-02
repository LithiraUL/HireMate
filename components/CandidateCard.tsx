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
  return (
    <div
      className="card cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <FiMail className="mr-1" size={14} />
              {candidate.email}
            </p>
          </div>
        </div>
        {candidate.age && (
          <span className="badge badge-info">{candidate.age} years</span>
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
