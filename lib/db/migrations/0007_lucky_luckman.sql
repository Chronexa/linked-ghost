DO $$ BEGIN
    CREATE TYPE "public"."voice_example_source" AS ENUM('own_post', 'reference');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"description" text,
	"default_for" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD COLUMN IF NOT EXISTS "conversation_id" uuid;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD COLUMN IF NOT EXISTS "quality_warnings" jsonb;--> statement-breakpoint
ALTER TABLE "pillars" ADD COLUMN IF NOT EXISTS "cta" text;--> statement-breakpoint
ALTER TABLE "pillars" ADD COLUMN IF NOT EXISTS "positioning" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_headline" varchar(500);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_summary" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "default_instructions" text;--> statement-breakpoint
ALTER TABLE "voice_examples" ADD COLUMN IF NOT EXISTS "source" "voice_example_source" DEFAULT 'own_post' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_month_unique" UNIQUE("user_id","month");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;