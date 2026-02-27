
import { db } from '@/lib/db';
import { users, pillars, voiceExamples, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'ankdhiman88@gmail.com'; // Corrected email
    console.log(`Checking data for ${email}...`);

    let user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.log('Exact match not found. Listing all users...');
        const allUsers = await db.select({ id: users.id, email: users.email }).from(users);
        console.table(allUsers);

        // Try to find case-insensitive match from list
        user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) as any;
    }

    if (!user) {
        console.error('User still not found!');
        return;
    }
    console.log('User found:', user.id, user.email);

    const userPillars = await db.select().from(pillars).where(eq(pillars.userId, user.id));
    console.log(`Pillars count: ${userPillars.length}`);
    userPillars.forEach(p => console.log(`- ${p.name}: ${p.description} (Status: ${p.status})`));

    const examples = await db.select().from(voiceExamples).where(eq(voiceExamples.userId, user.id));
    console.log(`Voice Examples count: ${examples.length}`);

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
    console.log('Profile exists:', !!profile);
    console.log('Voice Embedding exists:', !!profile?.voiceEmbedding);
}

main().catch(console.error).finally(() => process.exit(0));
