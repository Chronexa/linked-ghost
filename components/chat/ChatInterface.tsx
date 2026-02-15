import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useChat } from '@/lib/hooks/use-chat';
import { useConversation } from '@/lib/hooks/use-conversations';
import { useVoiceExamples } from '@/lib/hooks/use-voice';
import { draftsApi } from '@/lib/api-client';
import { ChatInput } from './ChatInput';
import { UserMessage } from './messages/UserMessage';
import { AssistantMessage } from './messages/AssistantMessage';
import { TopicCardsMessage } from './messages/TopicCardsMessage';
import { DraftVariantsMessage } from './messages/DraftVariantsMessage';
import { PerspectiveRequestMessage } from './messages/PerspectiveRequestMessage';

interface ChatInterfaceProps {
    conversationId: string;
    initialTrigger?: string | null;
}

const DEFAULT_REGENERATE_ANGLE = 'Try a different angle and tone for this topic.';

export function ChatInterface({ conversationId, initialTrigger }: ChatInterfaceProps) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { messages, setMessages, loading: loadingMessages, refetch } = useConversation(conversationId);
    const { sendMessage, searchIdeas, regenerateResearch, selectTopic, regenerateDrafts, isLoading: isSending } = useChat();
    const { data: voiceExamples, isLoading: isLoadingVoice } = useVoiceExamples();

    const hasTriggeredRef = useRef(false);

    // Handle initial triggers
    useEffect(() => {
        if (initialTrigger && !hasTriggeredRef.current && !loadingMessages) {
            hasTriggeredRef.current = true;
            if (initialTrigger === 'research') {
                // Optimistic message
                const tempId = 'temp-research-' + Date.now();
                setMessages(prev => [...prev, {
                    id: tempId,
                    role: 'user',
                    content: 'Research ideas for my content pillars',
                    createdAt: new Date(),
                    messageType: 'text'
                }]);

                searchIdeas(conversationId)
                    .then(() => refetch())
                    .catch(() => {
                        setMessages(prev => prev.filter(m => m.id !== tempId));
                    });
            }
        }
    }, [initialTrigger, conversationId, loadingMessages, searchIdeas, refetch, setMessages]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isSending]);

    // Polling for async generation
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        // Check for specific processing flag we added in the API
        const isProcessing = lastMessage?.metadata?.status === 'processing' ||
            lastMessage?.metadata?.type === 'draft_generation_in_progress';

        if (isProcessing && !loadingMessages) {
            const interval = setInterval(() => {
                refetch({ skipLoading: true });
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval);
        }
    }, [messages, loadingMessages, refetch]);

    const handleSend = async (content: string) => {
        // Optimistic update
        const tempId = Date.now().toString();
        const newUserMsg = {
            id: tempId,
            role: 'user',
            content,
            createdAt: new Date(),
            messageType: 'text'
        };
        setMessages(prev => [...prev, newUserMsg]);

        try {
            await sendMessage(conversationId, content);
            await refetch(); // Sync with server including assistant response
        } catch (err) {
            // Rollback or show error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleSelectTopic = async (topicContent: string, sources: any[], userPerspective?: string) => {
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: tempId,
            role: 'user',
            content: userPerspective ? `Selected topic with my angle: ${topicContent}` : `Selected topic: ${topicContent}`,
            createdAt: new Date(),
            messageType: 'text'
        }]);

        try {
            await selectTopic(
                conversationId,
                topicContent,
                sources,
                userPerspective,
                !!userPerspective
            );
            await refetch();
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            console.error(err);
        }
    };

    const handlePerspectiveSubmit = async (perspective: string, topicContext: any) => {
        // Need to re-call selectTopic but with perspective
        // We pass handlePerspectiveSubmit wrapper to `PerspectiveRequestMessage` that includes the meta.
        // Implemented inside renderMessage
    };

    // Custom renderer for message list to inject handlers
    const renderMessage = (msg: any, index: number) => {
        const isLatest = index === messages.length - 1;

        switch (msg.messageType) {
            case 'user':
            case 'text':
                return msg.role === 'user'
                    ? <UserMessage key={msg.id} content={msg.content} createdAt={msg.createdAt} />
                    : <AssistantMessage key={msg.id} content={msg.content} createdAt={msg.createdAt} />;

            case 'topic_cards':
                return (
                    <TopicCardsMessage
                        key={msg.id}
                        topics={msg.metadata?.topics || []}
                        onSelect={handleSelectTopic}
                        onRegenerate={() => regenerateResearch(conversationId).then(() => refetch())}
                    />
                );

            case 'perspective_request':
                return (
                    <div key={msg.id}>
                        <AssistantMessage content={msg.content} createdAt={msg.createdAt} />
                        {isLatest && (
                            <PerspectiveRequestMessage
                                isLoading={isSending}
                                onSubmit={(perspective) => {
                                    // Pass context from metadata
                                    selectTopic(
                                        conversationId,
                                        msg.metadata.topicContent,
                                        msg.metadata.sources,
                                        perspective
                                    ).then(() => refetch());
                                }}
                                onSkip={() => {
                                    selectTopic(
                                        conversationId,
                                        msg.metadata.topicContent,
                                        msg.metadata.sources,
                                        undefined,
                                        true // skipPerspective
                                    ).then(() => refetch());
                                }}
                            />
                        )}
                    </div>
                );

            case 'draft_variants':
                return (
                    <div key={msg.id}>
                        <AssistantMessage content={msg.content} createdAt={msg.createdAt} />
                        <DraftVariantsMessage
                            drafts={msg.metadata?.drafts || []}
                            topicId={msg.metadata?.drafts?.[0]?.topicId}
                            isRegenerating={isSending}
                            onRegenerate={() => {
                                const topicId = msg.metadata?.drafts?.[0]?.topicId;
                                if (topicId) {
                                    regenerateDrafts(conversationId, topicId, DEFAULT_REGENERATE_ANGLE)
                                        .then(() => refetch())
                                        .catch(() => { });
                                }
                            }}
                            onSelect={(draft) => router.push(`/drafts/${draft.id}`)}
                            onSave={async (draftId, fullText) => {
                                await draftsApi.update(draftId, { fullText });
                            }}
                        />
                    </div>
                );

            default:
                return <AssistantMessage key={msg.id} content={msg.content} createdAt={msg.createdAt} />;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full relative bg-background">
            {/* Voice Warning Banner */}
            {!isLoadingVoice && (voiceExamples?.data?.length || 0) < 3 && (
                <div className="bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-800/30 px-4 py-2 flex items-center justify-between backdrop-blur-sm z-20">
                    <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                        <span className="text-amber-500">⚠️</span>
                        <span>Your voice isn&apos;t fully trained ({(voiceExamples?.data?.length || 0)}/3 examples). Content might sound generic.</span>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-1 w-full relative">
                <div className="flex flex-col w-full max-w-[780px] mx-auto px-4 py-6 gap-6">
                    {loadingMessages && messages.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
                        </div>
                    ) : (
                        messages.map((msg, idx) => renderMessage(msg, idx))
                    )}

                    {isSending && (
                        <div className="flex w-full justify-start animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 rounded-tl-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce"></span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-4" />
                </div>
            </ScrollArea>

            <div className="w-full bg-transparent pb-6 pt-2 px-4 z-10">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={handleSend} isLoading={isSending} />
                </div>
            </div>
        </div>
    );
}
