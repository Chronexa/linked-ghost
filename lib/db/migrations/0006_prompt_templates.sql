ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "default_instructions" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_headline" varchar(500);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_summary" text;--> statement-breakpoint
CREATE TYPE "voice_example_source" AS ENUM('own_post', 'reference');--> statement-breakpoint
ALTER TABLE "voice_examples" ADD COLUMN IF NOT EXISTS "source" "voice_example_source" NOT NULL DEFAULT 'own_post';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"description" text,
	"default_for" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
