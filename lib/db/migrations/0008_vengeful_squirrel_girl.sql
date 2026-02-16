ALTER TABLE "generated_drafts" DROP CONSTRAINT "generated_drafts_topic_id_classified_topics_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_drafts" ALTER COLUMN "topic_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "generated_drafts" ADD CONSTRAINT "generated_drafts_topic_id_classified_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."classified_topics"("id") ON DELETE set null ON UPDATE no action;