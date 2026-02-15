/**
 * Domain types – single source of truth from DB schema.
 * Re-export schema types for use across frontend and API.
 * API response helpers kept here for list/single response shapes.
 */

export type {
  User,
  Profile,
  Pillar,
  VoiceExample,
  RawTopic,
  ClassifiedTopic,
  GeneratedDraft,
  Subscription,
  Conversation,
  ConversationMessage,
  PromptTemplate,
} from '@/lib/db/schema';

/**
 * API response wrapper (success payload)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
