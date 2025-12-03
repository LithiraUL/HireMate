import api from './api';
import { Candidate, FilterCriteria } from '@/types';

export const candidateService = {
  async getAllCandidates(): Promise<Candidate[]> {
    const response = await api.get('/candidates');
    return response.data;
  },

  async filterCandidates(criteria: FilterCriteria): Promise<Candidate[]> {
    const response = await api.post('/candidates/filter', criteria);
    return response.data;
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  async uploadCV(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await api.post('/users/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProfile(data: Partial<Candidate>): Promise<Candidate> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};
