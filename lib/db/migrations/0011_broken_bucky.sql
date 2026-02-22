ALTER TYPE "public"."subscription_status" ADD VALUE 'paused';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'halted';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."plan_type";--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('starter', 'growth');--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "plan_type" SET DATA TYPE "public"."plan_type" USING "plan_type"::"public"."plan_type";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "razorpay_plan_id" varchar(255);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_interval" varchar(10);