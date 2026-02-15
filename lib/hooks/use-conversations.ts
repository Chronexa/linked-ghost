import { useState, useCallback, useEffect } from 'react';

export function useConversations() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/conversations');
            if (!res.ok) throw new Error('Failed to fetch conversations');
            const data = await res.json();
            setConversations(data.data || []); // Access .data property from API response
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const createConversation = async () => {
        const res = await fetch('/api/conversations', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create conversation');
        const data = await res.json();
        // Optimistically add to list or refetch
        fetchConversations();
        return data;
    };

    return { conversations, loading, error, refetch: fetchConversations, createConversation };
}

export function useConversation(id: string | null) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchMessages = useCallback(async (options?: { skipLoading?: boolean }) => {
        if (!id) return;
        try {
            if (!options?.skipLoading) setLoading(true);
            const res = await fetch(`/api/conversations/${id}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setMessages(data.data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            if (!options?.skipLoading) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return { messages, setMessages, loading, error, refetch: fetchMessages };
}
