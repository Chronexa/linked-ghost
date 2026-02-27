DO $$ BEGIN
  CREATE TYPE "public"."performance_tier" AS ENUM('top_performer', 'above_average', 'average', 'below_average');
EXCEPTION WHEN duplicate_object THEN null;
END $$;-->statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_performance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar(255) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "draft_id" uuid REFERENCES "generated_drafts"("id") ON DELETE SET NULL,
  "likes" integer NOT NULL DEFAULT 0,
  "comments" integer NOT NULL DEFAULT 0,
  "reposts" integer NOT NULL DEFAULT 0,
  "impressions" integer NOT NULL DEFAULT 0,
  "engagement_rate" integer,
  "performance_tier" "performance_tier",
  "winning_patterns" jsonb,
  "post_text" text,
  "posted_at" timestamp NOT NULL,
  "measured_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
