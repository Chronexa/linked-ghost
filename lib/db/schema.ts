import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const pillarStatusEnum = pgEnum('pillar_status', ['active', 'inactive']);
export const topicSourceEnum = pgEnum('topic_source', ['perplexity', 'reddit', 'manual', 'fireflies']);
export const topicStatusEnum = pgEnum('topic_status', ['new', 'classified', 'archived']);
export const hookAngleEnum = pgEnum('hook_angle', ['emotional', 'analytical', 'storytelling', 'contrarian', 'data_driven']);
export const draftStatusEnum = pgEnum('draft_status', ['draft', 'approved', 'scheduled', 'posted', 'rejected']);
export const planTypeEnum = pgEnum('plan_type', ['starter', 'growth', 'agency']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'trialing']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'research_request', 'topic_cards', 'perspective_request', 'draft_variants', 'action_prompt']);


// ============================================================================
// TABLES
// ============================================================================

// Users table (synced from Clerk)
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

// User profiles (content generation settings)
// User profiles (content generation settings & identity)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),

  // 1. Professional Identity
  fullName: varchar('full_name', { length: 255 }),
  currentRole: varchar('current_role', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  location: varchar('location', { length: 100 }),
  linkedinUrl: text('linkedin_url'),
  linkedinHeadline: varchar('linkedin_headline', { length: 500 }),
  linkedinSummary: text('linkedin_summary'),

  // 2. Professional Background
  yearsOfExperience: varchar('years_of_experience', { length: 50 }), // "0-2", "3-5", etc.
  keyExpertise: jsonb('key_expertise'), // Array of strings
  careerHighlights: text('career_highlights'),
  currentResponsibilities: text('current_responsibilities'),

  // 3. Personal Positioning
  about: text('about'), // Bio
  howYouWantToBeSeen: varchar('how_you_want_to_be_seen', { length: 50 }), // "expert", "peer", etc.
  uniqueAngle: text('unique_angle'),

  // 4. Network & Goals
  currentConnections: integer('current_connections'),
  targetConnections: integer('target_connections'),
  networkComposition: jsonb('network_composition'), // Array of strings e.g. ["Founders", "Investors"]
  idealNetworkProfile: text('ideal_network_profile'),
  linkedinGoal: varchar('linkedin_goal', { length: 50 }), // "brand", "leads", etc.

  // existing fields (maintained for backward compatibility where needed)
  targetAudience: text('target_audience'), // Kept for legacy, can map to idealNetworkProfile
  contentGoal: text('content_goal'),
  customGoal: text('custom_goal'),
  writingStyle: text('writing_style'),

  // Voice & Settings
  voiceConfidenceScore: integer('voice_confidence_score').default(0), // 0-100
  voiceEmbedding: jsonb('voice_embedding'),
  lastVoiceTrainingAt: timestamp('last_voice_training_at'),
  perplexityEnabled: boolean('perplexity_enabled').default(true),
  redditEnabled: boolean('reddit_enabled').default(false),
  redditKeywords: text('reddit_keywords'),
  manualOnly: boolean('manual_only').default(false),

  // Metadata
  profileCompleteness: integer('profile_completeness').default(0),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // Prompt personalisation: default instructions for all AI (research, classification, draft)
  defaultInstructions: text('default_instructions'),
});

// Centralised prompt templates (global defaults; editable in Settings / admin)
export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  body: text('body').notNull(),
  description: text('description'),
  defaultFor: varchar('default_for', { length: 50 }).notNull(), // research | classification | draft_system | draft_user
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Content pillars (3-10 per user)
export const pillars = pgTable('pillars', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  tone: text('tone'), // e.g., "professional, analytical, forward-thinking"
  targetAudience: text('target_audience'), // e.g., "Tech founders, CTOs"
  customPrompt: text('custom_prompt'), // Additional instructions for AI
  cta: text('cta'), // e.g., "Subscribe to newsletter"
  positioning: text('positioning'), // e.g., "Contrarian expert"
  status: pillarStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Voice example source: own post or target reference (style to emulate)
export const voiceExampleSourceEnum = pgEnum('voice_example_source', ['own_post', 'reference']);

// Voice training examples (user's past LinkedIn posts or reference posts they want to sound like)
export const voiceExamples = pgTable('voice_examples', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  pillarId: uuid('pillar_id').references(() => pillars.id, { onDelete: 'set null' }),
  postText: text('post_text').notNull(),
  characterCount: integer('character_count').notNull(),
  embedding: jsonb('embedding'), // OpenAI text-embedding-3-small
  status: varchar('status', { length: 50 }).notNull().default('active'),
  source: voiceExampleSourceEnum('source').notNull().default('own_post'), // own_post | reference
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Raw topics (discovered from Perplexity/Reddit, before classification)
export const rawTopics = pgTable('raw_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  source: topicSourceEnum('source').notNull(),
  sourceUrl: text('source_url'),
  content: text('content').notNull(),
  rawData: jsonb('raw_data'), // Original API response
  status: topicStatusEnum('status').notNull().default('new'),
  discoveredAt: timestamp('discovered_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Classified topics (AI-classified and scored, ready for generation)
export const classifiedTopics = pgTable('classified_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  rawTopicId: uuid('raw_topic_id').references(() => rawTopics.id, { onDelete: 'set null' }),
  pillarId: uuid('pillar_id').notNull().references(() => pillars.id, { onDelete: 'cascade' }),
  pillarName: varchar('pillar_name', { length: 100 }).notNull(),
  source: topicSourceEnum('source').notNull(),
  sourceUrl: text('source_url'),
  content: text('content').notNull(),
  aiScore: integer('ai_score').notNull(), // 0-100
  hookAngle: hookAngleEnum('hook_angle').notNull(),
  reasoning: text('reasoning'), // Why AI scored it this way
  keyPoints: jsonb('key_points'), // Extracted key points
  suggestedHashtags: jsonb('suggested_hashtags'), // Array of hashtag suggestions
  status: varchar('status', { length: 50 }).notNull().default('classified'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  classifiedAt: timestamp('classified_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Generated drafts (AI-generated LinkedIn posts)
export const generatedDrafts = pgTable('generated_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }), // Link back to chat
  topicId: uuid('topic_id').references(() => classifiedTopics.id, { onDelete: 'set null' }),
  pillarId: uuid('pillar_id').notNull().references(() => pillars.id, { onDelete: 'cascade' }),
  userPerspective: text('user_perspective').notNull(), // User's take on the topic that generated this draft
  variantLetter: varchar('variant_letter', { length: 1 }).notNull(), // A, B, or C
  fullText: text('full_text').notNull(),
  hook: text('hook'), // Opening line
  body: text('body'), // Main content
  cta: text('cta'), // Call to action
  hashtags: jsonb('hashtags'), // Array of hashtags
  qualityWarnings: jsonb('quality_warnings'), // Array of validation warnings
  characterCount: integer('character_count').notNull(),
  estimatedEngagement: integer('estimated_engagement'), // Predicted likes/comments
  status: draftStatusEnum('status').notNull().default('draft'),
  editedText: text('edited_text'), // User-edited version
  feedbackNotes: text('feedback_notes'), // User notes
  approvedAt: timestamp('approved_at'),
  scheduledFor: timestamp('scheduled_for'),
  postedAt: timestamp('posted_at'),
  linkedinPostId: varchar('linkedin_post_id', { length: 255 }), // LinkedIn API post ID
  metadata: jsonb('metadata'), // Store additional context (angle, source, etc.)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Subscriptions (Razorpay subscription data)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  razorpayCustomerId: varchar('razorpay_customer_id', { length: 255 }).notNull(),
  razorpaySubscriptionId: varchar('razorpay_subscription_id', { length: 255 }).notNull().unique(),
  planType: planTypeEnum('plan_type').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at'),
  trialEnd: timestamp('trial_end'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Usage tracking (for billing and limits)
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: varchar('month', { length: 7 }).notNull(), // YYYY-MM format
  postsGenerated: integer('posts_generated').notNull().default(0),
  regenerationsUsed: integer('regenerations_used').notNull().default(0),
  topicsClassified: integer('topics_classified').notNull().default(0),
  voiceAnalyses: integer('voice_analyses').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.month),
}));

// Conversations (chat sessions)
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }), // Auto-generated from first message
  lastMessagePreview: text('last_message_preview'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Conversation messages
export const conversationMessages = pgTable('conversation_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  messageType: messageTypeEnum('message_type'), // 'text', 'research_request', 'topic_cards', etc.
  metadata: jsonb('metadata'), // Stores topic cards, draft IDs, sources, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  pillars: many(pillars),
  voiceExamples: many(voiceExamples),
  rawTopics: many(rawTopics),
  classifiedTopics: many(classifiedTopics),
  generatedDrafts: many(generatedDrafts),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  usageTracking: many(usageTracking),
  conversations: many(conversations),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const pillarsRelations = relations(pillars, ({ one, many }) => ({
  user: one(users, {
    fields: [pillars.userId],
    references: [users.id],
  }),
  voiceExamples: many(voiceExamples),
  classifiedTopics: many(classifiedTopics),
  generatedDrafts: many(generatedDrafts),
}));

export const voiceExamplesRelations = relations(voiceExamples, ({ one }) => ({
  user: one(users, {
    fields: [voiceExamples.userId],
    references: [users.id],
  }),
  pillar: one(pillars, {
    fields: [voiceExamples.pillarId],
    references: [pillars.id],
  }),
}));

export const rawTopicsRelations = relations(rawTopics, ({ one }) => ({
  user: one(users, {
    fields: [rawTopics.userId],
    references: [users.id],
  }),
}));

export const classifiedTopicsRelations = relations(classifiedTopics, ({ one, many }) => ({
  user: one(users, {
    fields: [classifiedTopics.userId],
    references: [users.id],
  }),
  rawTopic: one(rawTopics, {
    fields: [classifiedTopics.rawTopicId],
    references: [rawTopics.id],
  }),
  pillar: one(pillars, {
    fields: [classifiedTopics.pillarId],
    references: [pillars.id],
  }),
  generatedDrafts: many(generatedDrafts),
}));

export const generatedDraftsRelations = relations(generatedDrafts, ({ one }) => ({
  user: one(users, {
    fields: [generatedDrafts.userId],
    references: [users.id],
  }),
  topic: one(classifiedTopics, {
    fields: [generatedDrafts.topicId],
    references: [classifiedTopics.id],
  }),
  pillar: one(pillars, {
    fields: [generatedDrafts.pillarId],
    references: [pillars.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, {
    fields: [usageTracking.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationMessages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationMessages.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPES (for TypeScript inference)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type NewPromptTemplate = typeof promptTemplates.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Pillar = typeof pillars.$inferSelect;
export type NewPillar = typeof pillars.$inferInsert;

export type VoiceExample = typeof voiceExamples.$inferSelect;
export type NewVoiceExample = typeof voiceExamples.$inferInsert;

export type RawTopic = typeof rawTopics.$inferSelect;
export type NewRawTopic = typeof rawTopics.$inferInsert;

export type ClassifiedTopic = typeof classifiedTopics.$inferSelect;
export type NewClassifiedTopic = typeof classifiedTopics.$inferInsert;

export type GeneratedDraft = typeof generatedDrafts.$inferSelect;
export type NewGeneratedDraft = typeof generatedDrafts.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type NewConversationMessage = typeof conversationMessages.$inferInsert;
