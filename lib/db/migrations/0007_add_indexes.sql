-- Indexes for list/filter queries by user and status (CTO Phase C2)
CREATE INDEX IF NOT EXISTS "pillars_user_id_idx" ON "pillars" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "raw_topics_user_id_idx" ON "raw_topics" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "raw_topics_user_id_status_idx" ON "raw_topics" ("user_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "classified_topics_user_id_idx" ON "classified_topics" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "classified_topics_user_id_status_idx" ON "classified_topics" ("user_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generated_drafts_user_id_idx" ON "generated_drafts" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generated_drafts_user_id_status_idx" ON "generated_drafts" ("user_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voice_examples_user_id_idx" ON "voice_examples" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voice_examples_pillar_id_idx" ON "voice_examples" ("pillar_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_user_id_idx" ON "conversations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_messages_conversation_id_idx" ON "conversation_messages" ("conversation_id");--> statement-breakpoint
-- C3: Pillar slug unique per user
CREATE UNIQUE INDEX IF NOT EXISTS "pillars_user_id_slug_unique" ON "pillars" ("user_id", "slug");
