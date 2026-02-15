import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { db } from '@/lib/db';
import { conversations, conversationMessages } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// Helper to group conversations by date
function groupConversations(items: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const groups = {
        today: [] as any[],
        yesterday: [] as any[],
        last7Days: [] as any[],
        older: [] as any[]
    };

    items.forEach(item => {
        const date = new Date(item.createdAt);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            groups.today.push(item);
        } else if (date.getTime() === yesterday.getTime()) {
            groups.yesterday.push(item);
        } else if (date.getTime() > last7Days.getTime()) {
            groups.last7Days.push(item);
        } else {
            groups.older.push(item);
        }
    });

    return groups;
}

/**
 * GET /api/conversations
 * List user's conversations grouped by date
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
    try {
        // Fetch all conversations for the user, ordered by updated_at desc
        const userConversations = await db
            .select({
                id: conversations.id,
                title: conversations.title,
                lastMessagePreview: conversations.lastMessagePreview,
                createdAt: conversations.createdAt,
                updatedAt: conversations.updatedAt,
                messageCount: sql<number>`count(${conversationMessages.id})::int`
            })
            .from(conversations)
            .leftJoin(conversationMessages, eq(conversationMessages.conversationId, conversations.id))
            .where(eq(conversations.userId, user.id))
            .groupBy(conversations.id)
            .orderBy(desc(conversations.updatedAt));

        return responses.ok(userConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return errors.internal('Failed to fetch conversations');
    }
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const [newConversation] = await db
            .insert(conversations)
            .values({
                userId: user.id,
                title: 'New Conversation',
                lastMessagePreview: '',
            })
            .returning();

        return responses.created(newConversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        return errors.internal('Failed to create conversation');
    }
});
