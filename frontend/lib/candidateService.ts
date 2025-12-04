import api from './api';
import { Candidate, FilterCriteria } from '@/types';

export const candidateService = {
  async getAllCandidates(): Promise<Candidate[]> {
    const response = await api.get('/users/search');
    return response.data.candidates || response.data;
  },

  async filterCandidates(criteria: FilterCriteria): Promise<Candidate[]> {
    const params = new URLSearchParams();
    if (criteria.skills && criteria.skills.length > 0) {
      params.append('skills', criteria.skills.join(','));
    }
    if (criteria.ageMin) params.append('minAge', criteria.ageMin.toString());
    if (criteria.ageMax) params.append('maxAge', criteria.ageMax.toString());
    if (criteria.employmentType) params.append('employmentType', criteria.employmentType);
    if (criteria.workMode) params.append('workMode', criteria.workMode);
    
    const response = await api.get(`/users/search?${params.toString()}`);
    return response.data.candidates || response.data;
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get(`/users/${id}`);
    return response.data.user || response.data;
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
