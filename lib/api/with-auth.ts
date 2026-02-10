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
        return errors.unauthorized('User not found in database');
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
