import api from './api';
import { Job } from '@/types';

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    const response = await api.get('/jobs');
    return response.data.jobs || response.data;
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data.job || response.data;
  },

  async createJob(data: Partial<Job>): Promise<Job> {
    const response = await api.post('/jobs', data);
    return response.data.job || response.data;
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data.job || response.data;
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async getMyJobs(): Promise<Job[]> {
    const response = await api.get('/jobs/employer/my-jobs');
    return response.data.jobs || response.data;
  },

  async sendJobInvitation(jobId: string, candidateId: string, positionTitle: string, message?: string): Promise<void> {
    await api.post(`/jobs/${jobId}/invite`, { candidateId, positionTitle, message });
  },
};
