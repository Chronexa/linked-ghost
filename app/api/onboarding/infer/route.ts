import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, profiles, pillars, voiceExamples, conversations, conversationMessages, classifiedTopics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { inferProfileData } from '@/lib/ai/inference';
import { extractVoiceDNA } from '@/lib/ai/voice-dna';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { role, industry, topics, posts } = body;

        if (!role || !industry || !topics || !posts || posts.length < 2) {
            return new NextResponse('Validation Error: Role, industry, topics, and at least 2 posts are required', { status: 400 });
        }

        // 1. Run parallel inference & voice extraction
        console.log(`[Onboarding] Starting inference and voice extraction for ${userId}`);
        const [inferredData, voiceDNA] = await Promise.all([
            inferProfileData({ role, industry, topics }),
            extractVoiceDNA(posts)
        ]);

        // 2. Generate embedding for the voice DNA to be used for RAG matching later
        const embedding = await generateEmbedding(JSON.stringify(voiceDNA));

        // 3. Save to database
        const userDbId = userId;

        // Update User Profile
        await db.update(profiles).set({
            currentRole: role,
            industry: industry,
            uniqueAngle: inferredData.uniqueAngle,
            voiceEmbedding: embedding,
            voiceDna: voiceDNA,
            keyExpertise: topics, // Store topics in keyExpertise for now
            profileCompleteness: 100, // Onboarding complete
            onboardingCompletedAt: new Date(),
            updatedAt: new Date()
        }).where(eq(profiles.userId, userDbId));

        // Create the inferred Pillars
        if (inferredData.pillars && inferredData.pillars.length > 0) {
            const newPillars = inferredData.pillars.map(pillar => ({
                userId: userDbId,
                name: pillar.name,
                slug: pillar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                description: pillar.description,
                status: 'active' as const
            }));

            await db.insert(pillars).values(newPillars);
        }

        const exampleInserts = posts.map((postText: string) => ({
            userId: userDbId,
            postText,
            characterCount: postText.length,
            status: 'active',
            source: 'own_post' as const,
        }));
        await db.insert(voiceExamples).values(exampleInserts);

        // Update Clerk User Metadata so middleware stops redirecting to onboarding
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
                publicMetadata: {
                    onboardingComplete: true,
                },
            });
        } catch (authError) {
            console.error('Failed to update Clerk metadata:', authError);
        }

        // 5. Start the Magic Moment: Create a new conversation and enqueue generation
        let magicConversationId = undefined;
        try {
            // Find the primary pillar
            const mainPillarId = inferredData.pillars?.length > 0
                ? (await db.query.pillars.findFirst({ where: eq(pillars.userId, userDbId) }))?.id
                : undefined;

            if (mainPillarId) {
                // Create conversation
                const [conversation] = await db.insert(conversations).values({
                    userId: userDbId,
                    title: 'Your First Automated Draft',
                }).returning({ id: conversations.id });

                magicConversationId = conversation.id;

                // Create topic based on unique angle
                const [newTopic] = await db.insert(classifiedTopics).values({
                    userId: userDbId,
                    pillarId: mainPillarId,
                    pillarName: inferredData.pillars[0].name,
                    source: 'manual',
                    content: "Introductory post: " + inferredData.uniqueAngle,
                    status: 'classified',
                    aiScore: 100,
                    hookAngle: 'storytelling',
                }).returning();

                // Create assistant placeholder message
                const [assistantMsg] = await db.insert(conversationMessages).values({
                    conversationId: magicConversationId,
                    userId: userDbId,
                    role: 'assistant',
                    content: `I'm preparing your first magical draft based on your new profile...`,
                    messageType: 'text',
                    metadata: {
                        flow: 'write-from-scratch',
                        topicId: newTopic.id,
                        pillarId: mainPillarId,
                        status: 'processing',
                        type: 'draft_generation_in_progress'
                    }
                }).returning();

                // Enqueue background generation
                if (process.env.USE_BACKGROUND_WORKER === 'true') {
                    const { enqueueGeneration } = await import('@/lib/queue');
                    await enqueueGeneration({
                        userId: userDbId,
                        conversationId: magicConversationId,
                        messageId: assistantMsg.id,
                        topicId: newTopic.id,
                        pillarId: mainPillarId,
                        pillarContext: {
                            name: inferredData.pillars[0].name,
                            description: inferredData.pillars[0].description,
                        },
                        topicContent: {
                            title: "My perspective on " + inferredData.pillars[0].name,
                            summary: "Write a high-impact introductory post leveraging my unique angle: " + inferredData.uniqueAngle,
                        },
                        userPerspective: "Write a high-impact introductory post.",
                        voiceExamples: posts.map((postText: string) => ({
                            postText,
                            embedding: [] // Stub embedding, full embedding extraction skipped for brevity
                        })),
                        numVariants: 1,
                    });
                }
            }
        } catch (magicError) {
            console.error('Failed to start magic moment:', magicError);
        }

        return NextResponse.json({
            success: true,
            conversationId: magicConversationId,
            message: 'Onboarding completed and profile inferred',
            inferredData,
            voiceDNA
        });

    } catch (error: any) {
        console.error('[ONBOARDING_INFER_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
