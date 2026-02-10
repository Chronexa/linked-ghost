/**
 * Global TypeScript type definitions
 */

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string | null;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  linkedinUrl: string | null;
  bio: string | null;
  voiceConfidence: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CONTENT PILLARS
// ============================================

export interface Pillar {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  tone: string | null;
  targetAudience: string | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// VOICE TRAINING
// ============================================

export interface VoiceExample {
  id: string;
  userId: string;
  pillarId: string | null;
  postText: string;
  characterCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
}

// ============================================
// TOPICS
// ============================================

export type TopicSource = 'perplexity' | 'reddit' | 'manual';
export type TopicStatus = 'pending' | 'classified' | 'drafted' | 'rejected';
export type HookAngle = 'rational' | 'emotional' | 'aspirational' | 'contrarian';

export interface Topic {
  id: string;
  userId: string;
  content: string;
  url: string | null;
  source: TopicSource;
  pillarId: string | null;
  pillarName: string | null;
  aiScore: number;
  hookAngle: HookAngle | null;
  reasoning: string | null;
  status: TopicStatus;
  createdAt: Date;
  classifiedAt: Date | null;
}

// ============================================
// DRAFTS
// ============================================

export type DraftStatus = 'draft' | 'approved' | 'scheduled' | 'posted' | 'rejected';
export type DraftVariant = 'A' | 'B' | 'C';

export interface Draft {
  id: string;
  userId: string;
  topicId: string;
  variantLetter: DraftVariant;
  hook: string | null;
  body: string;
  cta: string | null;
  hashtags: string | null;
  fullText: string;
  characterCount: number;
  status: DraftStatus;
  feedbackNotes: string | null;
  approvedAt: Date | null;
  scheduledFor: Date | null;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  pillarId?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type AsyncState<T> = {
  data: T | null;
  status: Status;
  error: string | null;
};

// ============================================
// FORM TYPES
// ============================================

export interface OnboardingData {
  pillars: string[];
  voiceExamples: string[];
  sources: {
    perplexity: boolean;
    reddit: boolean;
    redditKeywords?: string;
  };
}

// ============================================
// SUBSCRIPTION & BILLING
// ============================================

export type SubscriptionTier = 'starter' | 'growth' | 'agency';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  postsLimit: number;
  postsUsed: number;
  pillarsLimit: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}
