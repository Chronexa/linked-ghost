/**
 * API Route Authentication Wrapper
 * Ensures user is authenticated before accessing protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errors } from './response';

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type AuthenticatedHandler = (
  req: NextRequest,
  context: {
    params: any;
    user: AuthenticatedUser;
  }
) => Promise<NextResponse>;

/**
 * Wrap API route handlers with authentication
 * 
 * Usage:
 * ```typescript
 * export const GET = withAuth(async (req, { user }) => {
 *   // user is guaranteed to exist here
 *   return responses.ok({ message: `Hello ${user.email}` });
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      // Get authenticated user from Clerk
      const session = await auth();
      const clerkUserId = session.userId;

      if (!clerkUserId) {
        return errors.unauthorized();
      }

      // Get user from database
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, clerkUserId),
        columns: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
        },
      });

      if (!dbUser) {
        // Auto-sync user from Clerk if missing.
        // On localhost, the Clerk webhook never fires (Clerk can't reach localhost),
        // so this auto-sync MUST also create the profiles row the webhook would normally create.
        console.log(`User ${clerkUserId} not found in DB. Syncing from Clerk...`);
        try {
          const { currentUser } = await import('@clerk/nextjs/server');
          const clerkUser = await currentUser();

          if (clerkUser) {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const fullName = `${clerkUser.firstName} ${clerkUser.lastName}`.trim();

            if (email) {
              await db.insert(users).values({
                id: clerkUserId,
                email: email,
                fullName: fullName || 'Unknown User',
                avatarUrl: clerkUser.imageUrl,
              }).onConflictDoUpdate({
                // If email already exists (user re-registered with same email = new Clerk ID),
                // update the row's id to the new Clerk ID so all FK constraints pass.
                target: users.email,
                set: {
                  id: clerkUserId,
                  fullName: fullName || 'Unknown User',
                  avatarUrl: clerkUser.imageUrl,
                  updatedAt: new Date(),
                },
              });

              console.log(`User ${email} synced to DB.`);

              // Extract LinkedIn URL from OAuth external accounts (mimics webhook logic)
              let linkedinUrl: string | null = null;
              const externalAccounts = clerkUser.externalAccounts || [];
              const linkedinAccount = externalAccounts.find(
                (acc: any) => acc.provider === 'oauth_linkedin' || acc.provider === 'oauth_linkedin_oidc'
              );
              if (linkedinAccount) {
                const identifier = (linkedinAccount as any).username || (linkedinAccount as any).publicIdentifier;
                if (identifier) {
                  linkedinUrl = `https://www.linkedin.com/in/${identifier}`;
                }
              }

              // Create the profiles row (this is done by the webhook in prod, but webhook doesn't fire on localhost)
              const { profiles } = await import('@/lib/db/schema');
              await db.insert(profiles).values({
                userId: clerkUserId,
                linkedinUrl: linkedinUrl || undefined,
                scraperStatus: linkedinUrl ? 'pending' : 'skipped',
              }).onConflictDoNothing();

              if (linkedinUrl) {
                console.log(`[withAuth] Profile created with LinkedIn URL: ${linkedinUrl}`);
              } else {
                console.log(`[withAuth] Profile created with no LinkedIn URL (scraperStatus=skipped)`);
              }

              // Retry fetching the user
              const syncedUser = await db.query.users.findFirst({
                where: eq(users.id, clerkUserId),
                columns: {
                  id: true,
                  email: true,
                  fullName: true,
                  avatarUrl: true,
                },
              });

              if (syncedUser) {
                return await handler(req, {
                  params: context.params,
                  user: syncedUser,
                });
              }
            }
          }
        } catch (syncError) {
          console.error('Failed to sync user from Clerk:', syncError);
        }

        return errors.unauthorized('User not found in database and sync failed');
      }

      // Call the handler with authenticated user
      return await handler(req, {
        params: context.params,
        user: dbUser,
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errors.internal('Authentication failed');
    }
  };
}

/**
 * Optional authentication - doesn't fail if user is not authenticated
 * Useful for public endpoints that have different behavior for logged-in users
 */
export function withOptionalAuth(
  handler: (
    req: NextRequest,
    context: { params: any; user: AuthenticatedUser | null }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: any }) => {
    try {
      const session = await auth();
      const clerkUserId = session.userId;

      let user: AuthenticatedUser | null = null;

      if (clerkUserId) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, clerkUserId),
          columns: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        });

        if (dbUser) {
          user = dbUser;
        }
      }

      return await handler(req, {
        params: context.params,
        user,
      });
    } catch (error) {
      console.error('Optional auth error:', error);
      // Continue without user
      return await handler(req, {
        params: context.params,
        user: null,
      });
    }
  };
}
