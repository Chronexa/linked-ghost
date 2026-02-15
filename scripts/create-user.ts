import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    console.log('👤 Creating temporary test user...');

    const userId = 'user_test_123';

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (existingUser) {
        console.log('✅ Test user already exists.');
        return;
    }

    // Create user
    await db.insert(users).values({
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        status: 'active',
    });

    console.log('✅ Created test user: user_test_123');
    process.exit(0);
}

main().catch(console.error);
