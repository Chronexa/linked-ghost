/**
 * ensureUserExists — reliable user row upsert for local dev
 * ──────────────────────────────────────────────────────────
 * The Clerk webhook doesn't fire on localhost, so the `users` table row
 * is never created automatically. This util creates it on-demand.
 *
 * CRITICAL: We use onConflictDoUpdate on email (not just onConflictDoNothing)
 * because a user may delete their Clerk account and re-sign up with the same
 * email address, getting a NEW Clerk user ID. In that case:
 *   - onConflictDoNothing would silently skip the insert (email already exists)
 *   - The new Clerk ID would never appear in the `users` table
 *   - All FK constraints on profiles/voiceExamples/pillars would fail
 *
 * By using onConflictDoUpdate(target: email), we UPDATE the row's id to the
 * new Clerk ID when the email already exists.
 */

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function ensureUserExists(userId: string): Promise<boolean> {
    try {
        // Check if user already exists with this exact Clerk ID
        const existing = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, userId),
            columns: { id: true },
        });

        if (existing) return true; // already correct — fast path

        // User row missing (webhook didn't fire on local, or user re-registered)
        const { currentUser } = await import('@clerk/nextjs/server');
        const clerkUser = await currentUser();

        if (!clerkUser) {
            console.error(`[ensureUserExists] currentUser() returned null for ${userId}`);
            return false;
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) {
            console.error(`[ensureUserExists] No email found for Clerk user ${userId}`);
            return false;
        }

        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;
        const avatarUrl = clerkUser.imageUrl || null;

        // UPSERT: if email already exists (re-registration with same email),
        // update the ID to the new Clerk ID so FK constraints pass.
        await db.insert(users).values({
            id: userId,
            email,
            fullName,
            avatarUrl,
        }).onConflictDoUpdate({
            target: users.email,
            set: {
                id: userId,
                fullName,
                avatarUrl,
                updatedAt: new Date(),
            },
        });

        console.log(`[ensureUserExists] User row created/updated for ${userId} (${email})`);
        return true;
    } catch (err) {
        console.error(`[ensureUserExists] Failed for ${userId}:`, err);
        return false;
    }
}
