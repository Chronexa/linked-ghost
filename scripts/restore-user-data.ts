
import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/lib/db';
import { profiles, users, rawTopics, pillars, generatedDrafts, classifiedTopics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🛠️  Restoring User Data...');

    const REAL_USER_ID = 'user_39Yv0K8JtKXRmavYlh3RAODmW7F'; // Ankit
    const TEST_USER_ID = 'user_test_123';

    // 1. Check if profile exists for Real User
    const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, REAL_USER_ID)
    });

    if (!existingProfile) {
        console.log('⚠️  No profile found for real user. Creating one...');
        await db.insert(profiles).values({
            userId: REAL_USER_ID, // Link to real user
            fullName: 'Ankit Dhiman',
            currentRole: 'Founder',
            companyName: 'ContentPilot AI',
            industry: 'SaaS',
            yearsOfExperience: '5-10',
            linkedinGoal: 'brand',
            onboardingCompletedAt: new Date(), // Mark explicitly as complete
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Created default profile for Ankit.');
    } else {
        console.log('✅ Profile already exists for Ankit.');
    }

    // 2. Migrate Data from Test User to Real User
    console.log('📦 Migrating topics from Test User to Real User...');

    // Raw Topics
    const topicUpdate = await db.update(rawTopics)
        .set({ userId: REAL_USER_ID })
        .where(eq(rawTopics.userId, TEST_USER_ID))
        .returning({ id: rawTopics.id });
    console.log(`- Migrated ${topicUpdate.length} raw topics.`);

    // Classified Topics
    const classifiedUpdate = await db.update(classifiedTopics)
        .set({ userId: REAL_USER_ID })
        .where(eq(classifiedTopics.userId, TEST_USER_ID))
        .returning({ id: classifiedTopics.id });
    console.log(`- Migrated ${classifiedUpdate.length} classified topics.`);

    // Drafts
    const draftUpdate = await db.update(generatedDrafts)
        .set({ userId: REAL_USER_ID })
        .where(eq(generatedDrafts.userId, TEST_USER_ID))
        .returning({ id: generatedDrafts.id });
    console.log(`- Migrated ${draftUpdate.length} drafts.`);

    // Pillars (if any on Test User, move them too just in case)
    const pillarUpdate = await db.update(pillars)
        .set({ userId: REAL_USER_ID })
        .where(eq(pillars.userId, TEST_USER_ID))
        .returning({ id: pillars.id });
    console.log(`- Migrated ${pillarUpdate.length} pillars.`);

    console.log('🎉 Data restoration complete!');
    process.exit(0);
}

main().catch(console.error);
