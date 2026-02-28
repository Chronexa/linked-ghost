import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { enqueueResearch } from '@/lib/queue';
import { responses, errors } from '@/lib/api/response';

export const dynamic = 'force-dynamic';


/**
 * POST /api/research
 * Trigger immediate research for the authenticated user
 */
export const POST = withAuth(async (req: NextRequest, { user }) => {
    try {
        // Enqueue the research job
        await enqueueResearch(user.id);

        return responses.ok({
            message: 'Research job started in background',
            jobId: `research-${user.id}-${Date.now()}`
        });
    } catch (error) {
        console.error('Error triggering research:', error);
        return errors.internal('Failed to start research job');
    }
});
