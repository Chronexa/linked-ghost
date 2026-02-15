ALTER TABLE "profiles" ADD COLUMN "full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_role" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "industry" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "years_of_experience" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "key_expertise" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "career_highlights" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_responsibilities" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "how_you_want_to_be_seen" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "unique_angle" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "current_connections" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "target_connections" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "network_composition" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "ideal_network_profile" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "linkedin_goal" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_completeness" integer DEFAULT 0;