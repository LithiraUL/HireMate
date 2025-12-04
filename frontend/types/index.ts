export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  
  // Candidate fields
  age?: number;
  skills?: string[];
  cvUrl?: string;
  cvPublicId?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  jobPreferences?: JobPreference;
  
  // Employer fields
  companyName?: string;
  companyAddress?: string;
  contactNo?: string;
  
  // Common fields
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Candidate extends User {
  age: number;
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
  _id: string;
  jobId?: string; // Alias for _id
  title: string;
  description: string;
  requiredSkills: string[];
  experienceRequired: number;
  jobType: 'full-time' | 'part-time' | 'contract';
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship'; // Backend field name
  workMode: 'onsite' | 'remote' | 'hybrid';
  salaryRange?: string | { min?: number; max?: number; currency?: string };
  status: 'open' | 'closed' | 'on-hold';
  employer?: {
    _id: string;
    companyName?: string;
  };
  postedBy?: {
    _id: string;
    name: string;
    email: string;
    role: 'employer';
    companyName?: string;
  };
  postedAt?: Date;
  createdAt: Date;
  applicationsCount?: number;
}

export interface Application {
  _id: string;
  applicationId?: string; // Alias for _id
  job: Job | {
    _id: string;
    title: string;
    description?: string;
    requiredSkills: string[];
    jobType?: string;
    employmentType?: string;
    workMode?: string;
    employer?: {
      _id?: string;
      companyName?: string;
    };
  };
  candidate?: {
    _id: string;
    name: string;
    email: string;
    age?: number;
    skills: string[];
    cvUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    jobPreferences?: JobPreference;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Interview {
  _id: string;
  interviewId?: string; // Alias for _id
  applicationId?: string;
  application?: string;
  job: {
    _id: string;
    title: string;
  };
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  employer?: {
    _id: string;
    name: string;
    companyName?: string;
  };
  date: Date;
  time: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  createdAt?: Date;
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
