import api from './api';
import { Application } from '@/types';

export const applicationService = {
  async applyForJob(jobId: string): Promise<Application> {
    const response = await api.post('/applications', { jobId });
    return response.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  ): Promise<Application> {
    const response = await api.put(`/applications/${applicationId}`, { status });
    return response.data;
  },
};
