'use client';

import React from 'react';
import { Job } from '@/types';
import { FiMapPin, FiClock, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onApply?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  showActions,
  onEdit,
  onDelete,
  onApply,
}) => {
  return (
    <div
      className="card cursor-pointer hover:border-primary-500 border-2 border-transparent transition-all"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
          {job.employer && (
            <p className="text-sm text-gray-600">{job.employer.companyName}</p>
          )}
        </div>
        <span
          className={`badge ${
            job.status === 'open' ? 'badge-success' : 'badge-warning'
          }`}
        >
          {job.status}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.requiredSkills.slice(0, 4).map((skill, index) => (
          <span key={index} className="badge badge-info">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 4 && (
          <span className="badge bg-gray-100 text-gray-600">
            +{job.requiredSkills.length - 4} more
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <FiBriefcase className="mr-2" />
          <span className="capitalize">{job.jobType}</span>
        </div>
        <div className="flex items-center">
          <FiMapPin className="mr-2" />
          <span className="capitalize">{job.workMode}</span>
        </div>
        <div className="flex items-center">
          <FiClock className="mr-2" />
          <span>{job.experienceRequired}+ years exp</span>
        </div>
        {job.salaryRange && (
          <div className="flex items-center">
            <FiDollarSign className="mr-2" />
            <span>
              {typeof job.salaryRange === 'string' 
                ? job.salaryRange 
                : job.salaryRange.min && job.salaryRange.max
                  ? `${job.salaryRange.currency || 'LKR'} ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}`
                  : job.salaryRange.min
                    ? `${job.salaryRange.currency || 'LKR'} ${job.salaryRange.min.toLocaleString()}+`
                    : job.salaryRange.max
                      ? `Up to ${job.salaryRange.currency || 'LKR'} ${job.salaryRange.max.toLocaleString()}`
                      : 'Negotiable'
              }
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
        </span>

        {showActions && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button onClick={onEdit} className="text-sm text-primary-600 hover:text-primary-700">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-sm text-red-600 hover:text-red-700">
                Delete
              </button>
            )}
            {onApply && (
              <button onClick={onApply} className="btn-primary text-sm py-1">
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
