import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseChatOptions {
    conversationId?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);

    // Send a basic text message
    const sendMessage = useCallback(async (conversationId: string, content: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, role: 'user', messageType: 'text' }),
            });

            if (!res.ok) throw new Error('Failed to send message');

            const data = await res.json();
            return data;
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Trigger Research Ideas
    const searchIdeas = useCallback(async (conversationId: string, pillarId?: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/research-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, pillarId })
            });
            if (!res.ok) throw new Error('Failed to research ideas');
            return await res.json();
        } catch (error) {
            toast.error('Failed to research ideas');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Regenerate research ideas (same conversation, optional extra instructions)
    const regenerateResearch = useCallback(async (conversationId: string, additionalInstructions?: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/research-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, regenerate: true, additionalInstructions: additionalInstructions?.trim() || undefined })
            });
            if (!res.ok) throw new Error('Failed to generate new ideas');
            return await res.json();
        } catch (error) {
            toast.error('Failed to generate new ideas');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Select Topic & Generate
    const selectTopic = useCallback(async (
        conversationId: string,
        topicContent: string,
        sources: any[],
        userPerspective?: string,
        skipPerspective?: boolean
    ) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/select-topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    topicContent,
                    sources,
                    userPerspective,
                    skipPerspective
                })
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                const msg = (errBody as { error?: { message?: string } })?.error?.message || 'Failed to select topic';
                throw new Error(msg);
            }
            return await res.json();
        } catch (error) {
            toast.error('Failed to process topic');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Write from Scratch
    const writeFromScratch = useCallback(async (conversationId: string, rawThoughts: string, pillarId?: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/write-from-scratch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, rawThoughts, pillarId })
            });
            if (!res.ok) throw new Error('Failed to generate drafts');
            return await res.json();
        } catch (error) {
            toast.error('Failed to generate drafts');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Regenerate Drafts
    const regenerateDrafts = useCallback(async (conversationId: string, topicId: string, userPerspective: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/regenerate-drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, topicId, userPerspective })
            });
            if (!res.ok) throw new Error('Failed to regenerate');
            return await res.json();
        } catch (error) {
            toast.error('Failed to regenerate drafts');
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        sendMessage,
        searchIdeas,
        regenerateResearch,
        selectTopic,
        writeFromScratch,
        regenerateDrafts,
    };
}
