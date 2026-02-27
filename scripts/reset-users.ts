import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { clerkClient } from '@clerk/nextjs/server';

async function resetUsers() {
    console.log('🗑️  Starting user reset process...');

    try {
        // 1. Get all users from local DB
        const localUsers = await db.query.users.findMany();
        console.log(`Found ${localUsers.length} users in local database.`);

        if (localUsers.length === 0) {
            console.log('No users to delete.');
            return;
        }

        // 2. Delete from Clerk first
        console.log('Deleting users from Clerk...');
        const client = await clerkClient();
        for (const user of localUsers) {
            try {
                await client.users.deleteUser(user.id);
                console.log(`✅ Deleted user ${user.id} from Clerk`);
            } catch (err: any) {
                if (err.status === 404) {
                    console.log(`⚠️  User ${user.id} not found in Clerk, skipping`);
                } else {
                    console.error(`❌ Failed to delete user ${user.id} from Clerk:`, err.message);
                }
            }
        }

        // 3. Delete from local DB (cascades to all other tables)
        console.log('Deleting users from local database (will cascade to profiles, pillars, drafts, etc)...');
        await db.delete(users);

        console.log('🎉 Reset complete! You can now test the new onboarding flow as a fresh user.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error during reset:', error);
        process.exit(1);
    }
}

resetUsers();
