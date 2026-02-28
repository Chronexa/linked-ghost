import { db } from '../lib/db';
import { profiles } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
async function main() {
    const p = await db.query.profiles.findFirst({
        where: eq(profiles.userId, "user_3AHqNUZ7lKr6iaTKUOePnutKQnG")
    });
    console.log("Profile scraperStatus:", p?.scraperStatus);
    process.exit(0);
}
main().catch(console.error);
