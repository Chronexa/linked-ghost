import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { conversationMessages, conversations, pillars, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { discoverTopics } from '@/lib/ai/perplexity';
import { getPrompt, PROMPT_KEYS } from '@/lib/prompts/store';

const researchSchema = z.object({
    conversationId: z.string().uuid(),
    pillarId: z.string().uuid().optional(),
    query: z.string().optional(),
    regenerate: z.boolean().optional(),
    additionalInstructions: z.string().max(1000).optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, researchSchema);
        if (!validation.success) return validation.error;

        const { conversationId, pillarId, query, additionalInstructions } = validation.data;

        // Verify conversation
        const conversation = await db.query.conversations.findFirst({
            where: and(
                eq(conversations.id, conversationId),
                eq(conversations.userId, user.id)
            ),
        });

        if (!conversation) return errors.notFound('Conversation');

        let searchDomain = query || 'trending topics';
        let pillarName = '';
        let pillarContextStr = '';

        if (pillarId) {
            const pillar = await db.query.pillars.findFirst({
                where: eq(pillars.id, pillarId),
            });
            if (pillar) {
                searchDomain = pillar.targetAudience || pillar.name;
                pillarName = pillar.name;
                pillarContextStr = pillar.description
                    ? `Focus on topics relevant to: ${pillar.name}. ${pillar.description}`
                    : `Focus on topics relevant to: ${pillar.name}.`;
            }
        } else {
            // New Logic: Use user's active pillars to guide "General" research
            const userPillars = await db.select().from(pillars).where(and(eq(pillars.userId, user.id), eq(pillars.status, 'active')));
            if (userPillars.length > 0) {
                const pillarNames = userPillars.map(p => p.name).join(', ');
                const pillarContexts = userPillars.map(p => `${p.name}: ${p.description || ''}`).join('; ');

                searchDomain = query || `Trending topics in ${pillarNames}`;
                pillarContextStr = `Focus on topics relevant to the user's content pillars: ${pillarContexts}`;
            }
        }

        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, user.id),
            columns: { defaultInstructions: true, linkedinHeadline: true, linkedinSummary: true },
        });
        const userInstructions = profile?.defaultInstructions ?? '';

        let systemPrompt: string | undefined;
        let userQuery: string | undefined;
        try {
            systemPrompt = await getPrompt(PROMPT_KEYS.RESEARCH_SYSTEM, { userInstructions });
            userQuery = await getPrompt(PROMPT_KEYS.RESEARCH_USER, {
                domain: searchDomain,
                count: 6,
                pillarContext: pillarContextStr,
                userInstructions: userInstructions ? `User instructions: ${userInstructions}` : '',
                additionalInstructions: additionalInstructions ? `Additional instructions for this search: ${additionalInstructions}` : '',
                linkedInHeadline: profile?.linkedinHeadline ?? '',
                linkedInSummary: profile?.linkedinSummary ?? '',
            });
        } catch {
            systemPrompt = undefined;
            userQuery = undefined;
        }

        await db.insert(conversationMessages).values({
            conversationId,
            userId: user.id,
            role: 'user',
            content: query || `Research ideas for ${pillarName || 'my content'}`,
            messageType: 'research_request',
            metadata: { pillarId, pillarName },
        });

        const result = await discoverTopics({
            domain: searchDomain,
            pillarContext: pillarName || undefined,
            count: 6,
            systemPrompt: systemPrompt || undefined,
            userQuery: userQuery || undefined,
        });

        // Save assistant message with topic cards
        const [assistantMessage] = await db
            .insert(conversationMessages)
            .values({
                conversationId,
                userId: user.id,
                role: 'assistant',
                content: `I found ${result.topics.length} trending topics for you based on "${searchDomain}".`,
                messageType: 'topic_cards',
                metadata: {
                    topics: result.topics,
                    query: result.query,
                    sources: result.metadata,
                },
            })
            .returning();

        // Update conversation
        await db
            .update(conversations)
            .set({
                lastMessagePreview: assistantMessage.content,
                updatedAt: new Date(),
            })
            .where(eq(conversations.id, conversationId));

        return responses.created(assistantMessage);

    } catch (error) {
        console.error('Error in research-ideas:', error);
        return errors.internal('Failed to research ideas');
    }
});
