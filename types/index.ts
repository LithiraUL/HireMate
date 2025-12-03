export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  createdAt: Date;
}

export interface Candidate extends User {
  age?: number;
  skills: string[];
  cvUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  jobPreferences: JobPreference;
}

export interface Employer extends User {
  companyName: string;
  companyAddress: string;
  contactNo: string;
}

export interface JobPreference {
  employmentType: 'full-time' | 'part-time' | 'both';
  workMode: 'onsite' | 'remote' | 'hybrid' | 'any';
}

export interface Job {
  jobId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceRequired: number;
  jobType: 'full-time' | 'part-time';
  workMode: 'onsite' | 'remote' | 'hybrid';
  salaryRange?: string;
  status: 'open' | 'closed';
  createdAt: Date;
  employerId: string;
  employer?: Employer;
}

export interface Application {
  applicationId: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  appliedAt: Date;
  candidate?: Candidate;
  job?: Job;
}

export interface Interview {
  interviewId: string;
  applicationId: string;
  date: Date;
  time: string;
  meetingLink?: string;
  status: 'scheduled' | 'confirmed' | 'declined' | 'completed';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FilterCriteria {
  skills?: string[];
  ageMin?: number;
  ageMax?: number;
  employmentType?: 'full-time' | 'part-time';
  workMode?: 'onsite' | 'remote' | 'hybrid';
}

export interface ValidationReport {
  candidateId: string;
  githubAnalysis?: {
    repositories: number;
    primaryLanguages: string[];
    skillsFound: string[];
  };
  linkedinAnalysis?: {
    verified: boolean;
    skillsMatched: string[];
  };
  overallScore: number;
}
