CREATE TYPE "public"."draft_status" AS ENUM('draft', 'approved', 'scheduled', 'posted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."hook_angle" AS ENUM('emotional', 'analytical', 'storytelling', 'contrarian', 'data_driven');--> statement-breakpoint
CREATE TYPE "public"."pillar_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('starter', 'growth', 'agency');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."topic_source" AS ENUM('perplexity', 'reddit', 'manual', 'fireflies');--> statement-breakpoint
CREATE TYPE "public"."topic_status" AS ENUM('new', 'classified', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "classified_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"raw_topic_id" uuid,
	"pillar_id" uuid NOT NULL,
	"pillar_name" varchar(100) NOT NULL,
	"source" "topic_source" NOT NULL,
	"source_url" text,
	"content" text NOT NULL,
	"ai_score" integer NOT NULL,
	"hook_angle" "hook_angle" NOT NULL,
	"reasoning" text,
	"key_points" jsonb,
	"suggested_hashtags" jsonb,
	"status" varchar(50) DEFAULT 'classified' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"classified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"topic_id" uuid NOT NULL,
	"pillar_id" uuid NOT NULL,
	"variant_letter" varchar(1) NOT NULL,
	"full_text" text NOT NULL,
	"hook" text,
	"body" text,
	"cta" text,
	"hashtags" jsonb,
	"character_count" integer NOT NULL,
	"estimated_engagement" integer,
	"status" "draft_status" DEFAULT 'draft' NOT NULL,
	"edited_text" text,
	"feedback_notes" text,
	"approved_at" timestamp,
	"scheduled_for" timestamp,
	"posted_at" timestamp,
	"linkedin_post_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pillars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"tone" text,
	"target_audience" text,
	"custom_prompt" text,
	"status" "pillar_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"linkedin_url" text,
	"target_audience" text,
	"writing_style" text,
	"voice_confidence_score" integer DEFAULT 0,
	"voice_embedding" jsonb,
	"last_voice_training_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "raw_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"source" "topic_source" NOT NULL,
	"source_url" text,
	"content" text NOT NULL,
	"raw_data" jsonb,
	"status" "topic_status" DEFAULT 'new' NOT NULL,
	"discovered_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"trial_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"month" varchar(7) NOT NULL,
	"posts_generated" integer DEFAULT 0 NOT NULL,
	"regenerations_used" integer DEFAULT 0 NOT NULL,
	"topics_classified" integer DEFAULT 0 NOT NULL,
	"voice_analyses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"avatar_url" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "voice_examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"pillar_id" uuid,
	"post_text" text NOT NULL,
	"character_count" integer NOT NULL,
	"embedding" jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classified_topics" ADD CONSTRAINT "classified_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classified_topics" ADD CONSTRAINT "classified_topics_raw_topic_id_raw_topics_id_fk" FOREIGN KEY ("raw_topic_id") REFERENCES "public"."raw_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classified_topics" ADD CONSTRAINT "classified_topics_pillar_id_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_topic_id_classified_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."classified_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_pillar_id_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pillars" ADD CONSTRAINT "pillars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_topics" ADD CONSTRAINT "raw_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_examples" ADD CONSTRAINT "voice_examples_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_examples" ADD CONSTRAINT "voice_examples_pillar_id_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."pillars"("id") ON DELETE set null ON UPDATE no action;