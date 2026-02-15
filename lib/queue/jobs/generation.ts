import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { generatedDrafts } from '@/lib/db/schema';
import { generateDraftVariants } from '@/lib/ai/generation';

interface GenerationJobData {
    userId: string;
    topicId: string;
    pillarId: string;
    pillarContext: any;
    topicContent: any;
    voiceExamples: any[];
}

/**
 * Handle draft generation job
 * Uses OpenAI (GPT-4) to generate 3 variants
 */
export async function generationJob(job: Job<GenerationJobData>) {
    const { userId, topicId, pillarId, pillarContext, topicContent, voiceExamples } = job.data;

    try {
        console.log(`✍️ Generating drafts for user ${userId} on topic ${topicId}`);

        // Call AI Generation Logic
        const result = await generateDraftVariants({
            topicTitle: topicContent.title,
            topicDescription: topicContent.summary,
            userPerspective: 'Write an engaging LinkedIn post about this topic.',
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
            userPerspective: 'Write an engaging LinkedIn post about this topic.',
            variantLetter: variant.variantLetter,
            fullText: variant.post.fullText,
            hook: variant.post.hook,
            body: variant.post.body,
            cta: variant.post.cta,
            hashtags: variant.post.hashtags,
            characterCount: variant.post.characterCount,
            estimatedEngagement: variant.post.estimatedEngagement || 0,
            status: 'draft' as const,
        }));

        await db.insert(generatedDrafts).values(draftInserts);

        return { draftsCreated: draftInserts.length };
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Generation job failed for user ${userId}:`, error.message);
            // BullMQ will handle the retry based on job options
            throw error;
        } else {
            console.error(`❌ Generation job failed for user ${userId}: Unknown error`, error);
            throw new Error('Unknown error during generation');
        }
    }
}
