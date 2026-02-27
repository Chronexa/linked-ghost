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
  updateProfile: (data: {
    linkedinUrl?: string;
    linkedinHeadline?: string | null;
    linkedinSummary?: string | null;
    // Identity
    fullName?: string;
    currentRole?: string;
    companyName?: string;
    industry?: string;
    location?: string;
    // Background
    yearsOfExperience?: string;
    keyExpertise?: string[];
    careerHighlights?: string;
    currentResponsibilities?: string;
    // Positioning
    about?: string;
    howYouWantToBeSeen?: string;
    uniqueAngle?: string;
    // Network
    currentConnections?: number;
    targetConnections?: number;
    networkComposition?: string[];
    idealNetworkProfile?: string;
    linkedinGoal?: string;
    // Settings
    perplexityEnabled?: boolean;
    redditEnabled?: boolean;
    redditKeywords?: string;
    manualOnly?: boolean;
    onboardingCompletedAt?: Date;
    profileCompleteness?: number;
    defaultInstructions?: string | null;
  }) =>
    apiClient.patch('/user/profile', data),
  getSubscription: () => apiClient.get('/user/subscription'),
  inferOnboarding: (data: { role: string; industry: string; topics: string[]; posts: string[] }) =>
    apiClient.post('/onboarding/infer', data),
};

// Voice Training
export const voiceApi = {
  getExamples: (params?: { status?: string; pillarId?: string }) =>
    apiClient.get('/voice/examples', { params }),
  addExample: (data: { postText: string; pillarId?: string; source?: 'own_post' | 'reference' }) =>
    apiClient.post('/voice/examples', data),
  deleteExample: (id: string) => apiClient.delete(`/voice/examples/${id}`),
  analyzeVoice: () => apiClient.post('/voice/analyze'),
};

// Pillars
export const pillarsApi = {
  list: (params?: { status?: string; sort?: string }) =>
    apiClient.get('/pillars', { params }),
  get: (id: string) => apiClient.get(`/pillars/${id}`),
  create: (data: { name: string; description?: string; tone?: string; targetAudience?: string; customPrompt?: string; cta?: string; positioning?: string }) =>
    apiClient.post('/pillars', data),
  update: (id: string, data: Partial<{ name: string; description?: string; tone?: string; targetAudience?: string; customPrompt?: string; status?: string; cta?: string; positioning?: string }>) =>
    apiClient.patch(`/pillars/${id}`, data),
  delete: (id: string) => apiClient.delete(`/pillars/${id}`),
};

// Raw topics (discovery - before classification)
export const rawTopicsApi = {
  list: (params?: { source?: string; page?: number; limit?: number }) =>
    apiClient.get('/raw-topics', { params }),
  get: (id: string) => apiClient.get(`/raw-topics/${id}`),
  create: (data: { content: string; sourceUrl?: string; source?: string; status?: string }) =>
    apiClient.post('/raw-topics', data),
  delete: (id: string) => apiClient.delete(`/raw-topics/${id}`),
};

// Topics (classified)
export const topicsApi = {
  list: (params?: { status?: string; pillarId?: string; minScore?: number; sort?: string; page?: number; limit?: number }) =>
    apiClient.get('/topics', { params }),
  get: (id: string) => apiClient.get(`/topics/${id}`),
  // `sourceUrl` is optional and used when topic comes from an external link
  create: (data: { content: string; sourceUrl?: string; pillarId?: string }) =>
    apiClient.post('/topics', data),
  update: (id: string, data: { pillarId?: string; status?: string }) =>
    apiClient.patch(`/topics/${id}`, data),
  delete: (id: string) => apiClient.delete(`/topics/${id}`),
  generate: (data: { topicId: string; userPerspective: string; pillarId?: string }) =>
    apiClient.post(`/topics/${data.topicId}/generate`, {
      userPerspective: data.userPerspective,
      pillarId: data.pillarId
    }),
  // `rawTopicId` links classification back to the original raw topic when applicable
  classify: (data: { rawTopicId?: string; topicContent: string; sourceUrl?: string; autoApprove?: boolean }) =>
    apiClient.post('/topics/classify', data),
  classifyBatch: (data: { topics: Array<{ content: string; sourceUrl?: string }>; autoApprove?: boolean }) =>
    apiClient.post('/topics/classify/batch', data),
};

// Drafts
export const draftsApi = {
  list: (params?: { status?: string; pillarId?: string; topicId?: string; sort?: string; page?: number; limit?: number }) =>
    apiClient.get('/drafts', { params }),
  get: (id: string) => apiClient.get(`/drafts/${id}`),
  update: (id: string, data: { fullText?: string; feedbackNotes?: string; status?: string }) =>
    apiClient.patch(`/drafts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/drafts/${id}`),
  approve: (id: string) => apiClient.post(`/drafts/${id}/approve`),
  schedule: (id: string, data: { scheduledFor: string }) =>
    apiClient.post(`/drafts/${id}/schedule`, data),
  cancelSchedule: (id: string) => apiClient.delete(`/drafts/${id}/schedule`),
  rewrite: (id: string, data: { currentText: string; instruction: string }) =>
    apiClient.post(`/drafts/${id}/rewrite`, data),
  rewriteHook: (id: string, data: { currentText: string }) =>
    apiClient.post(`/drafts/${id}/rewrite-hook`, data),
};

// Discovery
export const discoveryApi = {
  discover: (data: { domain: string; pillarId?: string; count?: number; autoSave?: boolean }) =>
    apiClient.post('/discover', data),
  research: (data: { topic: string; pillarId?: string; autoSave?: boolean }) =>
    apiClient.post('/discover/research', data),
  triggerBackgroundResearch: () => apiClient.post('/research'),
};

// Analytics
export const analyticsApi = {
  get: () => apiClient.get('/analytics'),
};

// Health
export const healthApi = {
  check: () => apiClient.get('/health'),
};
