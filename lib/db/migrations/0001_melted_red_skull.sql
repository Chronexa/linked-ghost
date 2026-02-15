ALTER TABLE "profiles" ADD COLUMN "perplexity_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "reddit_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "reddit_keywords" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "manual_only" boolean DEFAULT false;