import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { conversationMessages, conversations } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for creating a message
const createMessageSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    role: z.enum(['user', 'assistant']),
    messageType: z.enum(['text', 'research_request', 'topic_cards', 'perspective_request', 'draft_variants', 'action_prompt']).optional(),
    metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/conversations/:id/messages
 * Get all messages for a conversation
 */
export const GET = withAuth(async (req: NextRequest, { params, user }) => {
    try {
        const { id: conversationId } = params;

        // Verify conversation belongs to user
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.userId, user.id)
            ),
        });

        if (!conversation) {
            return errors.notFound('Conversation');
        }

        // Fetch messages
        const messages = await db
            .select()
            .from(conversationMessages)
            .where(eq(conversationMessages.conversationId, conversationId))
            .orderBy(asc(conversationMessages.createdAt));

        return responses.ok(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return errors.internal('Failed to fetch messages');
    }
});

/**
 * POST /api/conversations/:id/messages
 * Add a message to a conversation
 */
export const POST = withAuth(async (req: NextRequest, { params, user }) => {
    try {
        const { id: conversationId } = params;

        // Validate body
        const validation = await validateBody(req, createMessageSchema);
        if (!validation.success) return validation.error;

        const { content, role, messageType, metadata } = validation.data;

        // Verify conversation exists and belongs to user
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.userId, user.id)
            ),
        });

        if (!conversation) {
            return errors.notFound('Conversation');
        }

        // Insert message
        const [newMessage] = await db
            .insert(conversationMessages)
            .values({
                conversationId,
                userId: user.id,
                role,
                content,
                messageType: messageType || 'text',
                metadata: metadata || null,
            })
            .returning();

        // Update conversation last_message_preview and updated_at
        // Also set title if it's the first message and title is default
        const updates: any = {
            lastMessagePreview: content.substring(0, 100),
            updatedAt: new Date(),
        };

        if (conversation.title === 'New Conversation' && role === 'user') {
            updates.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        }

        await db
            .update(conversations)
            .set(updates)
            .where(eq(conversations.id, conversationId));

        return responses.created(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return errors.internal('Failed to create message');
    }
});
