import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
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
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  linkedinUrl: text('linkedin_url'),
  targetAudience: text('target_audience'),
  writingStyle: text('writing_style'),
  voiceConfidenceScore: integer('voice_confidence_score').default(0), // 0-100
  voiceEmbedding: jsonb('voice_embedding'), // Aggregated voice embedding
  lastVoiceTrainingAt: timestamp('last_voice_training_at'),
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
  status: pillarStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Voice training examples (user's past LinkedIn posts)
export const voiceExamples = pgTable('voice_examples', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  pillarId: uuid('pillar_id').references(() => pillars.id, { onDelete: 'set null' }),
  postText: text('post_text').notNull(),
  characterCount: integer('character_count').notNull(),
  embedding: jsonb('embedding'), // OpenAI text-embedding-3-small
  status: varchar('status', { length: 50 }).notNull().default('active'),
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
});

// Generated drafts (AI-generated LinkedIn posts)
export const generatedDrafts = pgTable('generated_drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  topicId: uuid('topic_id').notNull().references(() => classifiedTopics.id, { onDelete: 'cascade' }),
  pillarId: uuid('pillar_id').notNull().references(() => pillars.id, { onDelete: 'cascade' }),
  variantLetter: varchar('variant_letter', { length: 1 }).notNull(), // A, B, or C
  fullText: text('full_text').notNull(),
  hook: text('hook'), // Opening line
  body: text('body'), // Main content
  cta: text('cta'), // Call to action
  hashtags: jsonb('hashtags'), // Array of hashtags
  characterCount: integer('character_count').notNull(),
  estimatedEngagement: integer('estimated_engagement'), // Predicted likes/comments
  status: draftStatusEnum('status').notNull().default('draft'),
  editedText: text('edited_text'), // User-edited version
  feedbackNotes: text('feedback_notes'), // User notes
  approvedAt: timestamp('approved_at'),
  scheduledFor: timestamp('scheduled_for'),
  postedAt: timestamp('posted_at'),
  linkedinPostId: varchar('linkedin_post_id', { length: 255 }), // LinkedIn API post ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Subscriptions (Stripe subscription data)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
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

// ============================================================================
// TYPES (for TypeScript inference)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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
