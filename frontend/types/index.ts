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
  title: string;
  description: string;
  requiredSkills: string[];
  experienceRequired: number;
  jobType: 'full-time' | 'part-time' | 'contract';
  workMode: 'onsite' | 'remote' | 'hybrid';
  salaryRange?: { min: number; max: number };
  status: 'active' | 'inactive';
  postedBy: {
    _id: string;
    name: string;
    email: string;
    role: 'employer';
    companyName?: string;
  };
  postedAt: Date;
  applicationsCount?: number;
}

export interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
  };
  candidate: {
    _id: string;
    name: string;
    email: string;
export interface Interview {
  _id: string;
  application: string;
  job: {
    _id: string;
    title: string;
  };
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  employer: {
    _id: string;
    name: string;
    companyName?: string;
  };
  date: Date;
  time: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
} appliedAt: Date;
  updatedAt?: Date;
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
