
import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/lib/db';
import { profiles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🔍 Checking Profile Data...');

    const allProfiles = await db.select().from(profiles);
    const allUsers = await db.select().from(users);

    console.log('\n📄 Profiles:');
    allProfiles.forEach(p => {
        const owner = allUsers.find(u => u.id === p.userId)?.fullName || 'Unknown';
        console.log(`- For User: ${owner} [${p.userId}]`);
        console.log(`  - Role: ${p.currentRole}`);
        console.log(`  - Onboarding Completed: ${p.onboardingCompletedAt ? 'Yes' : 'No'}`);
    });
    process.exit(0);
}

main().catch(console.error);
