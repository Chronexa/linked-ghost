ALTER TABLE "subscriptions" RENAME COLUMN "stripe_customer_id" TO "razorpay_customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "razorpay_subscription_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id");