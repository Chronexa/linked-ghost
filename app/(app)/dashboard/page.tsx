'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { EmptyStateDashboard } from '@/components/chat/EmptyStateDashboard';
import { useConversations } from '@/lib/hooks/use-conversations';
import { useChat } from '@/lib/hooks/use-chat';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QuickPostModal } from '@/components/quick-post/QuickPostModal';
import { TrialNudge } from '@/components/subscription/trial-nudge';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get('conversation');
  const trigger = searchParams.get('trigger');

  const { createConversation } = useConversations();
  const { sendMessage } = useChat();

  const handleCreateConversation = async (triggerType?: string, initialMessage?: string) => {
    try {
      const newConv = await createConversation();

      if (initialMessage) {
        await sendMessage(newConv.data.id, initialMessage);
      }

      const params = new URLSearchParams();
      params.set('conversation', newConv.data.id);
      if (triggerType) params.set('trigger', triggerType);

      router.push(`/dashboard?${params.toString()}`);
    } catch (error) {
      console.error("Failed to create conversation", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };


  const [isQuickPostOpen, setIsQuickPostOpen] = React.useState(false);

  if (conversationId) {
    return (
      <div className="h-full">
        <ChatInterface conversationId={conversationId} initialTrigger={trigger} />
      </div>
    );
  }

  return (
    <>
      <TrialNudge />
      <EmptyStateDashboard
        onResearchIdeas={() => handleCreateConversation('research')}
        onQuickPost={() => setIsQuickPostOpen(true)}
      />
      <QuickPostModal
        isOpen={isQuickPostOpen}
        onClose={() => setIsQuickPostOpen(false)}
      />
    </>
  );
}
