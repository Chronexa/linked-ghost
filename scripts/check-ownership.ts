
import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/lib/db';
import { users, pillars, rawTopics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('🔍 Checking Data Ownership...');

    const allPillars = await db.select().from(pillars);
    const allTopics = await db.select().from(rawTopics);
    const allUsers = await db.select().from(users);

    console.log('\n👤 Users in DB:');
    allUsers.forEach(u => console.log(`- ${u.fullName} (${u.id})`));

    console.log('\n🏛️  Pillars:');
    allPillars.forEach(p => {
        const owner = allUsers.find(u => u.id === p.userId)?.fullName || 'Unknown';
        console.log(`- ${p.name} (Owned by: ${owner} [${p.userId}])`);
    });

    console.log('\n📝 Topics:');
    allTopics.slice(0, 5).forEach(t => { // Just show first 5
        const owner = allUsers.find(u => u.id === t.userId)?.fullName || 'Unknown';
        console.log(`- ${t.content.substring(0, 30)}... (Owned by: ${owner} [${t.userId}])`);
    });

    process.exit(0);
}

main().catch(console.error);
