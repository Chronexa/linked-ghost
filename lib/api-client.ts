/**
 * API Client
 * Axios-based client for making API requests with authentication
 */

import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (Clerk handles this automatically via cookies)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * API Functions
 */

// User & Profile
export const userApi = {
  getProfile: () => apiClient.get('/user'),
  updateProfile: (data: { linkedinUrl?: string; targetAudience?: string; writingStyle?: string }) =>
    apiClient.patch('/user/profile', data),
  getSubscription: () => apiClient.get('/user/subscription'),
};

// Voice Training
export const voiceApi = {
  getExamples: (params?: { status?: string; pillarId?: string }) =>
    apiClient.get('/voice/examples', { params }),
  addExample: (data: { postText: string; pillarId?: string }) =>
    apiClient.post('/voice/examples', data),
  deleteExample: (id: string) => apiClient.delete(`/voice/examples/${id}`),
  analyzeVoice: () => apiClient.post('/voice/analyze'),
};

// Pillars
export const pillarsApi = {
  list: (params?: { status?: string; sort?: string }) =>
    apiClient.get('/pillars', { params }),
  get: (id: string) => apiClient.get(`/pillars/${id}`),
  create: (data: { name: string; description?: string; tone?: string; targetAudience?: string; customPrompt?: string }) =>
    apiClient.post('/pillars', data),
  update: (id: string, data: Partial<{ name: string; description?: string; tone?: string; targetAudience?: string; customPrompt?: string; status?: string }>) =>
    apiClient.patch(`/pillars/${id}`, data),
  delete: (id: string) => apiClient.delete(`/pillars/${id}`),
};

// Topics
export const topicsApi = {
  list: (params?: { status?: string; pillarId?: string; minScore?: number; sort?: string; page?: number; limit?: number }) =>
    apiClient.get('/topics', { params }),
  get: (id: string) => apiClient.get(`/topics/${id}`),
  create: (data: { content: string; pillarId?: string }) =>
    apiClient.post('/topics', data),
  update: (id: string, data: { pillarId?: string; status?: string }) =>
    apiClient.patch(`/topics/${id}`, data),
  delete: (id: string) => apiClient.delete(`/topics/${id}`),
  generate: (id: string) => apiClient.post(`/topics/${id}/generate`),
  classify: (data: { topicContent: string; sourceUrl?: string; autoApprove?: boolean }) =>
    apiClient.post('/topics/classify', data),
  classifyBatch: (data: { topics: Array<{ content: string; sourceUrl?: string }>; autoApprove?: boolean }) =>
    apiClient.post('/topics/classify/batch', data),
};

// Drafts
export const draftsApi = {
  list: (params?: { status?: string; pillarId?: string; sort?: string; page?: number; limit?: number }) =>
    apiClient.get('/drafts', { params }),
  get: (id: string) => apiClient.get(`/drafts/${id}`),
  update: (id: string, data: { fullText?: string; feedbackNotes?: string; status?: string }) =>
    apiClient.patch(`/drafts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/drafts/${id}`),
  approve: (id: string) => apiClient.post(`/drafts/${id}/approve`),
  schedule: (id: string, data: { scheduledFor: string }) =>
    apiClient.post(`/drafts/${id}/schedule`, data),
  cancelSchedule: (id: string) => apiClient.delete(`/drafts/${id}/schedule`),
};

// Discovery
export const discoveryApi = {
  discover: (data: { domain: string; pillarId?: string; count?: number; autoSave?: boolean }) =>
    apiClient.post('/discover', data),
  research: (data: { topic: string; pillarId?: string; autoSave?: boolean }) =>
    apiClient.post('/discover/research', data),
};

// Health
export const healthApi = {
  check: () => apiClient.get('/health'),
};
