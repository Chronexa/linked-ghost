import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get current authenticated user in Server Components
 * @returns User object or null
 */
export async function getCurrentUser() {
    try {
        const session = await auth();
        const clerkUserId = session.userId;

        if (!clerkUserId) {
            return null;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, clerkUserId),
        });

        return user || null;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}
