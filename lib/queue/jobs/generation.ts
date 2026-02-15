import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { generatedDrafts, conversationMessages, conversations } from '@/lib/db/schema';
import { generateDraftVariants } from '@/lib/ai/generation';
import { eq } from 'drizzle-orm';
import { estimateEngagement } from '@/lib/ai/generation';

interface GenerationJobData {
    userId: string;
    conversationId: string;
    messageId: string; // The "Thinking..." message to update
    topicId: string;
    pillarId: string;
    pillarContext: {
        name: string;
        description?: string;
        tone?: string;
        targetAudience?: string;
        customPrompt?: string;
    };
    topicContent: {
        title: string;
        summary?: string;
    };
    userPerspective: string;
    voiceExamples: any[];
}

/**
 * Handle draft generation job
 * Uses OpenAI (GPT-4) to generate 3 variants
 */
export async function generationJob(job: Job<GenerationJobData>) {
    const { userId, conversationId, messageId, topicId, pillarId, pillarContext, topicContent, userPerspective, voiceExamples } = job.data;

    try {
        console.log(`✍️ Generating drafts for user ${userId} on topic ${topicId}`);

        // Call AI Generation Logic
        const result = await generateDraftVariants({
            topicTitle: topicContent.title,
            topicDescription: topicContent.summary,
            userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
            pillarName: pillarContext.name,
            pillarDescription: pillarContext.description,
            pillarTone: pillarContext.tone,
            targetAudience: pillarContext.targetAudience,
            customPrompt: pillarContext.customPrompt,
            voiceExamples: voiceExamples,
            userId,
        });

        console.log(`   Generated ${result.variants.length} drafts`);

        // Store drafts in DB
        const draftInserts = result.variants.map((variant) => ({
            userId,
            topicId,
            pillarId,
            userPerspective: userPerspective || 'Write an engaging LinkedIn post about this topic.',
            variantLetter: variant.variantLetter,
            fullText: variant.post.fullText,
            hook: variant.post.hook,
            body: variant.post.body,
            cta: variant.post.cta,
            hashtags: variant.post.hashtags,
            characterCount: variant.post.characterCount,
            estimatedEngagement: estimateEngagement(variant.post),
            status: 'draft' as const,
        }));

        const createdDrafts = await db.insert(generatedDrafts).values(draftInserts).returning();

        // Update the existing "Thinking..." message with the results
        await db.update(conversationMessages).set({
            content: `I've drafted two posts for you about "${topicContent.title}".`,
            messageType: 'draft_variants',
            metadata: {
                drafts: createdDrafts.map((d, i) => ({
                    ...d,
                    style: result.variants[i].style,
                    voiceMatchScore: result.variants[i].voiceMatchScore,
                    qualityWarnings: result.variants[i].qualityWarnings
                }))
            }
        }).where(eq(conversationMessages.id, messageId));

        // Update conversation preview
        await db.update(conversations).set({
            lastMessagePreview: `Generated drafts for "${topicContent.title}"`,
            updatedAt: new Date()
        }).where(eq(conversations.id, conversationId));

        return { draftsCreated: draftInserts.length };
    } catch (error) {
        // If failed, update the message to show error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Generation job failed for user ${userId}:`, errorMessage);

        await db.update(conversationMessages).set({
            content: `I encountered an error while generating drafts: ${errorMessage}. Please try again.`,
            messageType: 'text', // Revert to simple text
            metadata: { error: errorMessage }
        }).where(eq(conversationMessages.id, messageId));

        throw error;
    }
}
