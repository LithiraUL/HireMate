import api from './api';
import { Application } from '@/types';

export const applicationService = {
  async applyForJob(jobId: string): Promise<Application> {
    const response = await api.post('/applications', { jobId });
    return response.data.application || response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get('/applications/candidate/my-applications');
    return response.data.applications || response.data;
  },

  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data.applications || response.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  ): Promise<Application> {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data.application || response.data;
  },

  async getApplicants(filters?: {
    status?: string;
    skills?: string;
    minAge?: number;
    maxAge?: number;
    employmentType?: string;
    workMode?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.skills) params.append('skills', filters.skills);
    if (filters?.minAge) params.append('minAge', filters.minAge.toString());
    if (filters?.maxAge) params.append('maxAge', filters.maxAge.toString());
    if (filters?.employmentType) params.append('employmentType', filters.employmentType);
    if (filters?.workMode) params.append('workMode', filters.workMode);

    const response = await api.get(`/applications/employer/applicants?${params.toString()}`);
    return response.data.applicants || response.data;
  },
};
