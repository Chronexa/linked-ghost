import 'dotenv/config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        await db.execute(sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT`);
        await db.execute(sql`ALTER TABLE subscriptions ALTER COLUMN razorpay_customer_id DROP NOT NULL`);
        await db.execute(sql`ALTER TABLE subscriptions ALTER COLUMN razorpay_subscription_id DROP NOT NULL`);
        console.log("Database migrations applied successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

main();
