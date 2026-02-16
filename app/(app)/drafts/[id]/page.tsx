'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDraft, useUpdateDraft, useApproveDraft, useScheduleDraft, useDrafts } from '@/lib/hooks/use-drafts';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Copy, Check, ChevronLeft, Calendar, FileText } from 'lucide-react';

export default function DraftEditorPage() {
  const params = useParams() as { id: string };
  const draftId = params.id;
  const router = useRouter();

  const { data, isLoading } = useDraft(draftId);
  const payload: any = data?.data;
  const currentDraft = payload?.draft;
  const topic = payload?.topic;
  const pillarName = payload?.pillarName;
  // Use conversationId from draft data if available, or fall back to dashboard
  const conversationId = currentDraft?.conversationId;

  const updateDraft = useUpdateDraft();
  const approveDraft = useApproveDraft();
  const scheduleDraft = useScheduleDraft();

  const [editedText, setEditedText] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (!currentDraft) return;
    setEditedText(currentDraft.editedText || currentDraft.fullText || '');
    setFeedbackNotes(currentDraft.feedbackNotes || '');
  }, [currentDraft]);

  const handleSave = async () => {
    if (!currentDraft) return;
    await updateDraft.mutateAsync({
      id: currentDraft.id,
      data: { fullText: editedText, feedbackNotes: feedbackNotes || undefined },
    });
    toast.success('Saved changes');
  };

  const handleApprove = async () => {
    if (!currentDraft) return;
    await approveDraft.mutateAsync(currentDraft.id);
    toast.success('Draft approved');
    // If we have a conversation ID, go back there. Otherwise drafts list.
    if (conversationId) {
      router.push(`/dashboard?conversationId=${conversationId}`);
    } else {
      router.push('/drafts');
    }
  };

  const handleReject = async () => {
    if (!currentDraft) return;
    await updateDraft.mutateAsync({ id: currentDraft.id, data: { status: 'rejected' } });
    toast.success('Draft rejected');
    // If we have a conversation ID, go back there. Otherwise drafts list.
    if (conversationId) {
      router.push(`/dashboard?conversationId=${conversationId}`);
    } else {
      router.push('/drafts');
    }
  };

  const handleSchedule = async () => {
    if (!currentDraft || !scheduledFor) return;
    await scheduleDraft.mutateAsync({ id: currentDraft.id, scheduledFor });
    setShowScheduler(false);
    toast.success('Scheduled successfully');
  };

  const handleBack = () => {
    // If we have a conversation ID, go back there. Otherwise drafts list.
    if (conversationId) {
      router.push(`/dashboard?conversationId=${conversationId}`);
    } else {
      router.back();
    }
  }

  if (isLoading || !currentDraft) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const contextTopic = topic?.content;
  const contextPillar = pillarName;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-0 hover:bg-transparent"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Conversation
      </Button>

      {/* Context card: source topic + pillar */}
      {(contextTopic || contextPillar) && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-start gap-4">
              {contextPillar && (
                <Badge variant="outline" className="border-border text-muted-foreground">{contextPillar}</Badge>
              )}
              {contextTopic && (
                <p className="text-sm text-muted-foreground flex-1 min-w-0 line-clamp-2">
                  <span className="font-medium text-foreground mr-1">Topic:</span>
                  {contextTopic}
                </p>
              )}
              {topic?.sourceUrl && (
                <a
                  href={topic.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline shrink-0"
                >
                  Source →
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Draft Editor */}
      <DraftVariantCard
        draft={currentDraft}
        text={editedText}
        setText={setEditedText}
        onSave={handleSave}
        onApprove={handleApprove}
        onReject={handleReject}
        onSchedule={(date) => { setScheduledFor(date); handleSchedule(); }}
        isPending={updateDraft.isPending || approveDraft.isPending}
        singleMode
      />
    </div>
  );
}

function DraftVariantCard({
  draft,
  text,
  setText,
  onSave,
  onApprove,
  onReject,
  onSchedule,
  isPending,
  singleMode = false
}: {
  draft: any,
  text: string,
  setText: (s: string) => void,
  onSave: () => void,
  onApprove: () => void,
  onReject: () => void,
  onSchedule: (date: string) => void,
  isPending: boolean,
  singleMode?: boolean
}) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const charCount = text.length;
  const isOptimal = charCount >= 800 && charCount <= 1300;
  const isTooLong = charCount > 3000;

  return (
    <Card className="flex flex-col min-h-0 h-full">
      <CardHeader className="shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <span className="font-display font-bold text-sm">
                {draft.variantLetter}
              </span>
            </div>
            {!singleMode && <CardTitle className="text-base">Variant {draft.variantLetter}</CardTitle>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
              onClick={() => {
                navigator.clipboard.writeText(text);
                toast.success('Copied to clipboard');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Badge variant={isTooLong ? 'destructive' : isOptimal ? 'success' : 'outline'} className={cn(!isOptimal && !isTooLong && "text-muted-foreground font-normal")}>
              {charCount} / 3000
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="px-6 pb-4 flex-1 min-h-0">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Post content…"
            className="border resize-none shadow-sm focus-visible:ring-2 focus-visible:ring-ring min-h-[300px] text-base leading-relaxed p-4 rounded-md"
          />
        </div>
        <div className="px-6 py-4 border-t border-border space-y-3 bg-muted/5">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSave}
              disabled={isPending}
            >
              Save
            </Button>

            {draft.status === 'draft' && (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScheduler(true)}
                  disabled={isPending}
                  className="text-muted-foreground"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                  onClick={onReject}
                  disabled={isPending}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
          {showScheduler && (
            <div className="flex items-center gap-2 pt-2 animate-in slide-in-from-top-2">
              <input
                type="datetime-local"
                className="input text-sm flex-1 h-9"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                aria-label="Schedule date and time"
              />
              <Button size="sm" onClick={() => onSchedule(scheduleDate)}>
                Schedule
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground px-2"
                onClick={() => setShowScheduler(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
