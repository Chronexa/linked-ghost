import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generatedDrafts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { regenerateHooks } from '@/lib/ai/editing';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const draftId = (await params).id;
        const { currentText } = await req.json();

        if (!currentText) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const draft = await db.query.generatedDrafts.findFirst({
            where: and(eq(generatedDrafts.id, draftId), eq(generatedDrafts.userId, userId))
        });

        if (!draft) {
            return new NextResponse('Draft not found', { status: 404 });
        }

        const hooks = await regenerateHooks(currentText);

        return NextResponse.json({ hooks });

    } catch (error: any) {
        console.error('[DRAFTS_REWRITE_HOOK_ERROR]', error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
}
