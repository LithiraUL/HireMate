import api from './api';

interface HiringTrend {
  month: string;
  total: number;
  reviewed: number;
  shortlisted: number;
  rejected: number;
}

interface TimeToHireMetric {
  jobTitle: string;
  applicants: number;
  avgDays: number;
  postedDate: string;
}

interface TimeToHireData {
  overallAverage: number;
  jobMetrics: TimeToHireMetric[];
}

interface SkillCount {
  skill: string;
  count: number;
}

interface Demographics {
  totalApplicants: number;
  ageDistribution: { range: string; count: number }[];
  topSkills: SkillCount[];
  experienceDistribution: { level: string; count: number }[];
}

export const analyticsService = {
  // Get hiring trends over time
  getHiringTrends: async (period: '1month' | '3months' | '6months' | '1year' = '6months'): Promise<HiringTrend[]> => {
    try {
      const response = await api.get(`/analytics/hiring-trends?period=${period}`);
      console.log('Hiring trends response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hiring trends:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get time-to-hire metrics
  getTimeToHire: async (): Promise<TimeToHireData> => {
    try {
      const response = await api.get('/analytics/time-to-hire');
      console.log('Time to hire response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching time to hire:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get applicant demographics
  getDemographics: async (): Promise<Demographics> => {
    try {
      const response = await api.get('/analytics/demographics');
      console.log('Demographics response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching demographics:', error.response?.data || error.message);
      throw error;
    }
  },
};
