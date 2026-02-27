import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { responses, errors } from '@/lib/api/response';
import { validateBody } from '@/lib/api/validate';
import { db } from '@/lib/db';
import { pillars, voiceExamples, profiles, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { generateDraftVariants, estimateEngagement } from '@/lib/ai/generation';
import { retry, isRetryableError } from '@/lib/utils/retry';
import { checkUsageLimit, incrementUsage } from '@/lib/ai/usage';

const quickPostSchema = z.object({
    idea: z.string().min(10, "Please provide at least 10 characters for your text"),
    pillarId: z.string().uuid(),
    angle: z.enum(['story', 'insight', 'opinion', 'howto']).optional(),
    additionalContext: z.string().max(200).optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        const validation = await validateBody(req, quickPostSchema);
        if (!validation.success) return validation.error;

        const { idea, pillarId, angle, additionalContext } = validation.data;

        // Check usage limits
        const usageCheck = await checkUsageLimit(user.id, 'generate_post');
        if (!usageCheck.allowed) {
            return errors.rateLimit(`Usage limit reached for your ${usageCheck.plan} plan.`);
        }

        // Fetch Pillar
        const pillar = await db.query.pillars.findFirst({
            where: and(eq(pillars.id, pillarId), eq(pillars.userId, user.id))
        });

        if (!pillar) return errors.notFound('Pillar');

        // Fetch Voice Examples
        const allExamples = await db.select().from(voiceExamples)
            .where(and(eq(voiceExamples.userId, user.id), eq(voiceExamples.status, 'active')))
            .limit(20);

        const examples = allExamples.sort((a, b) => {
            const aPriority = a.pillarId === pillarId ? 0 : 1;
            const bPriority = b.pillarId === pillarId ? 0 : 1;
            if (aPriority !== bPriority) return aPriority - bPriority;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 10);

        // Fetch Profile for Author Context
        const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

        // Construct User Instructions
        let instructions = `User's Angle: ${angle || 'Not specified'}.\n`;
        if (additionalContext) instructions += `Additional Context: ${additionalContext}\n`;
        instructions += `\nPlease ensure the content differentiates clearly between the requested styles.`;

        // Generate 3 Variants with strict styles
        const genResult = await retry(
            () => generateDraftVariants({
                topicTitle: idea.length > 50 ? idea.substring(0, 50) + "..." : idea,
                topicDescription: "Quick Post Idea: " + idea,
                userPerspective: idea,
                pillarName: pillar.name,
                pillarDescription: pillar.description || undefined,
                pillarTone: pillar.tone || undefined,
                targetAudience: pillar.targetAudience || undefined,
                customPrompt: pillar.customPrompt || undefined,
                voiceExamples: examples.map((ex) => ({
                    postText: ex.postText,
                    embedding: ex.embedding as number[] | undefined,
                })),
                masterVoiceEmbedding: (profile?.voiceEmbedding as number[]) || undefined,
                numVariants: 3,
                styles: ['Professional', 'Conversational', 'Bold'],
                userInstructions: instructions,
                userId: user.id
            }),
            { maxAttempts: 3, delayMs: 1000, exponentialBackoff: true, retryOn: isRetryableError }
        );

        // Prepare response (don't save to DB yet, wait for user selection)
        // We return the generated content to the frontend.
        // Frontend will call another endpoint (POST /api/drafts) to save the SELECTED one.

        // Map variants for frontend display
        const variants = genResult.variants.map((v) => ({
            id: v.variantLetter, // Use letter as temp ID
            style: v.style || (v.variantLetter === 'A' ? 'Professional' : v.variantLetter === 'B' ? 'Conversational' : 'Bold'),
            content: v.post.fullText,
            hook: v.post.hook,
            metadata: {
                angle,
                source: 'quick_post',
                generatedVariants: genResult.variants.map(gv => gv.post.fullText) // Store all for potential recovery if we want to pass back
            }
        }));

        // Increment usage
        await incrementUsage(user.id, 'generate_post', 1); // Charge 1 credit for the set? Or 3? PRD says < 2 minutes. Let's charge 1 for the action.

        return responses.ok({
            variants,
            pillarName: pillar.name,
            topicTitle: genResult.topicTitle
        });

    } catch (error) {
        console.error("Error in quick-post:", error);
        return errors.internal("Failed to generate quick post");
    }
});
