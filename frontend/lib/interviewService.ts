import api from './api';
import { Interview } from '@/types';

export const interviewService = {
  async scheduleInterview(data: {
    applicationId: string;
    date: Date;
    time: string;
    meetingLink?: string;
  }): Promise<Interview> {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  async getMyInterviews(): Promise<Interview[]> {
    const response = await api.get('/interviews/my-interviews');
    return response.data;
  },

  async updateInterviewStatus(
    interviewId: string,
    status: 'confirmed' | 'declined'
  ): Promise<Interview> {
    const response = await api.put(`/interviews/${interviewId}`, { status });
    return response.data;
  },
};
