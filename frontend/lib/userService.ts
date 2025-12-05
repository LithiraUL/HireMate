import api from './api';
import { Candidate } from '@/types';

interface SearchParams {
  skills?: string;
  minAge?: number;
  maxAge?: number;
  employmentType?: string;
  workMode?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async searchCandidates(params: SearchParams): Promise<Candidate[]> {
    const queryParams = new URLSearchParams();
    
    if (params.skills) queryParams.append('skills', params.skills);
    if (params.minAge) queryParams.append('minAge', params.minAge.toString());
    if (params.maxAge) queryParams.append('maxAge', params.maxAge.toString());
    if (params.employmentType) queryParams.append('employmentType', params.employmentType);
    if (params.workMode) queryParams.append('workMode', params.workMode);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/users/search?${queryParams.toString()}`);
    return response.data.candidates || [];
  },

  async getProfile(): Promise<any> {
    const response = await api.get('/users/profile');
    return response.data.user || response.data;
  },

  async updateProfile(data: any): Promise<any> {
    const response = await api.put('/users/profile', data);
    return response.data.user || response.data;
  },
};
