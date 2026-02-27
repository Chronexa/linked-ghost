'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { GenerationProgress } from '@/components/generation/generation-progress';
import {
  useRawTopics,
  useRawTopic,
  useClassifyTopic,
  useClassifyBatch,
  useDeleteRawTopic,
  useTopics,
  useGenerateDrafts,
  useCreateRawTopic,
} from '@/lib/hooks/use-topics';
import { usePillars } from '@/lib/hooks/use-pillars';
import { useDiscoverTopics } from '@/lib/hooks/use-discovery';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/dashboard/empty-state';
import { WritePostModal } from '@/components/topics/write-post-modal';
import { Search, Layers, Sparkles, Filter, CheckCircle2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { InfoTooltip } from '@/components/ui/info-tooltip';

type Tab = 'research' | 'ideas' | 'ready';

const SOURCE_BADGE: Record<string, 'brand' | 'warning' | 'neutral'> = {
  perplexity: 'brand',
  reddit: 'warning',
  manual: 'neutral',
  fireflies: 'neutral',
};

export default function TopicsPage() {
  const [tab, setTab] = useState<Tab>('research');

  // Research State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);
  const [selectedSuggestionIndices, setSelectedSuggestionIndices] = useState<Set<number>>(new Set());
  const [autoClassify, setAutoClassify] = useState(false);

  // Topics State
  const [selectedRawId, setSelectedRawId] = useState<string | null>(null);
  const [selectedRawIds, setSelectedRawIds] = useState<Set<string>>(new Set());
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [activePillar, setActivePillar] = useState<string>('all');

  // Classification/Generation
  const [showGenerationProgress, setShowGenerationProgress] = useState(false);
  const [writePostModalOpen, setWritePostModalOpen] = useState(false);
  const [selectedTopicForGeneration, setSelectedTopicForGeneration] = useState<any>(null);

  // Hooks
  const { data: rawData, isLoading: rawLoading } = useRawTopics({ limit: 200 }); // Saved raw topics
  const { data: rawTopicDetail } = useRawTopic(selectedRawId);
  const { data: topicsData, isLoading: topicsLoading } = useTopics({ limit: 200 }); // Classified topics
  const { data: pillarsData, isLoading: pillarsLoading } = usePillars({ status: 'active' });

  const classifyOne = useClassifyTopic();
  const classifyBatch = useClassifyBatch();
  const deleteRaw = useDeleteRawTopic();
  const createRawTopic = useCreateRawTopic();
  const generateDrafts = useGenerateDrafts();
  const discoverTopics = useDiscoverTopics();

  // Derived Data
  const rawTopics = useMemo(() => (rawData as any)?.data?.data ?? [], [rawData]);
  const topics = useMemo(() => (topicsData as any)?.data ?? [], [topicsData]);
  const pillars = useMemo(() => (pillarsData as any)?.data ?? (pillarsData as any)?.data?.data ?? [], [pillarsData]);

  // Combined Topics View (Classified)
  const topicsByPillar = useMemo(() => {
    const map: Record<string, any[]> = {};
    pillars.forEach((p: any) => {
      map[p.id] = topics.filter((t: any) => t.pillarId === p.id);
    });
    map['all'] = topics;
    return map;
  }, [topics, pillars]);

  const displayTopics = topicsByPillar[activePillar] ?? [];
  const selectedRaw = selectedRawId
    ? (rawTopicDetail as any)?.data ?? rawTopics.find((t: any) => t.id === selectedRawId)
    : null;

  // --- Research Handlers ---

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSuggestedTopics([]);
    setSelectedSuggestionIndices(new Set());

    discoverTopics.mutate(
      {
        domain: searchQuery.trim(),
        count: 5,
        autoSave: false, // Don't save to DB automatically
      },
      {
        onSuccess: (data: any) => {
          // Flatten results if nested
          const results = data.data?.topics || [];
          setSuggestedTopics(results);
        }
      }
    );
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestionIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const saveSelectedSuggestions = async () => {
    const indices = Array.from(selectedSuggestionIndices);
    if (indices.length === 0) return;

    let savedCount = 0;
    const toastId = toast.loading('Saving selected topics...');

    try {
      await Promise.all(indices.map(async (index) => {
        const topic = suggestedTopics[index];
        const newTopic = await createRawTopic.mutateAsync({
          content: topic.content,
          source: 'perplexity', // Mark as research
          sourceUrl: topic.sourceUrl
        });

        // Auto-classify if enabled
        if (autoClassify && newTopic?.data?.id) {
          await classifyOne.mutateAsync({
            rawTopicId: newTopic.data.id,
            topicContent: topic.content,
            sourceUrl: topic.sourceUrl,
            autoApprove: true,
          });
        }
        savedCount++;
      }));

      if (autoClassify) {
        toast.success(`Saved & Classified ${savedCount} topics!`, { id: toastId });
      } else {
        toast.success(`Saved ${savedCount} topics to your library!`, { id: toastId });
      }

      // Remove saved from suggestions
      setSuggestedTopics(prev => prev.filter((_, i) => !selectedSuggestionIndices.has(i)));
      setSelectedSuggestionIndices(new Set());

      // Switch to Topics tab to show them (optional, maybe stay to research more)
      // setTab('topics'); 
    } catch (error) {
      toast.error('Failed to save some topics', { id: toastId });
    }
  };

  // --- Topics Handlers ---

  const handleClassifyThis = async () => {
    if (!selectedRaw?.id || !selectedRaw?.content) return;
    try {
      await classifyOne.mutateAsync({
        rawTopicId: selectedRaw.id,
        topicContent: selectedRaw.content,
        sourceUrl: selectedRaw.sourceUrl || undefined,
        autoApprove: true,
      });
      setSelectedRawId(null);
    } catch { }
  };

  const handleDeleteRaw = async (id: string) => {
    try {
      await deleteRaw.mutateAsync(id);
      if (selectedRawId === id) setSelectedRawId(null);
    } catch { }
  };

  const handleGenerate = (topic: any) => {
    setSelectedTopicForGeneration(topic);
    setWritePostModalOpen(true);
  };

  return (
    <div className="space-y-6 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GenerationProgress
        open={showGenerationProgress}
        onOpenChange={setShowGenerationProgress}
        isGenerating={generateDrafts.isPending}
      />

      <WritePostModal
        open={writePostModalOpen}
        onOpenChange={setWritePostModalOpen}
        topic={selectedTopicForGeneration}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Research & Topics</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Find inspiration, organize your ideas, and turn them into content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/topics/new">
            <Button variant="secondary" className="shadow-sm bg-card hover:bg-card/80 border-border/60">
              + Add topic manually
            </Button>
          </Link>
        </div>
      </div>

      {/* Missing Pillars Warning */}
      {!pillarsLoading && pillars.length === 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-start sm:items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full shrink-0">
            <Layers className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">Missing Content Pillars</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
              You need to define at least one Content Pillar (e.g., &quot;AI Strategy&quot;) to classify topics and generate relevant content.
            </p>
          </div>
          <Link href="/settings">
            <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900 dark:border-red-800 dark:text-red-300">
              Define Pillars
            </Button>
          </Link>
        </div>
      )}

      {/* Main Tabs */}
      <div className="border-b border-border mb-8">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setTab('research')}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2",
              tab === 'research'
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="w-4 h-4" />
            Research
            <InfoTooltip content="Search the live web for trending content ideas. Results are momentary and won't clutter your library unless saved." className="ml-1" />
          </button>
          <button
            onClick={() => setTab('ideas')}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2",
              tab === 'ideas'
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            Idea Library
            {rawTopics.length > 0 && (
              <Badge variant="neutral" className="ml-1 bg-muted px-1.5 py-0 text-[10px]">
                {rawTopics.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setTab('ready')}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2",
              tab === 'ready'
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Ready to Write
            {topics.length > 0 && (
              <Badge variant="neutral" className="ml-1 bg-muted px-1.5 py-0 text-[10px]">
                {topics.length}
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* === RESEARCH TAB === */}
      {tab === 'research' && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex shadow-sm rounded-xl overflow-hidden group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="What do you want to write about? (e.g. B2B Sales, AI Agents, Leadership)"
                className="flex-1 input-lg border-0 bg-card shadow-sm pl-6 h-14 text-lg focus:ring-0 focus:bg-background transition-colors"
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || discoverTopics.isPending}
                isLoading={discoverTopics.isPending}
                className="rounded-l-none h-14 px-8 text-base font-medium"
              >
                Find Ideas
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              We&apos;ll analyze top-performing content from Perplexity to find relevant angles.
            </p>
          </div>

          {/* Results Area */}
          <div className="mt-12">
            {suggestedTopics.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    Suggested Ideas
                    <InfoTooltip content="These are live results from the web. Select the ones you want to keep, or they will vanish when you leave." className="ml-1" />
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {selectedSuggestionIndices.size} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {suggestedTopics.map((topic, index) => {
                    const isSelected = selectedSuggestionIndices.has(index);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleSuggestion(index)}
                        className={cn(
                          "group relative p-5 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
                          isSelected
                            ? "bg-brand/5 border-brand ring-1 ring-brand/20"
                            : "bg-card border-border hover:border-brand/30"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className="pt-1">
                            <div className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                              isSelected ? "bg-brand border-brand" : "border-muted-foreground/30 bg-background"
                            )}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-base font-medium text-foreground leading-relaxed">
                              {topic.content}
                            </p>
                            {topic.sourceUrl && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="uppercase tracking-wider font-semibold text-[10px]">Source</span>
                                <span className="truncate max-w-sm">{topic.sourceUrl}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              !discoverTopics.isPending && (
                <EmptyState
                  icon={Sparkles}
                  headline="Start your research"
                  description="Enter a topic above to discover fresh content ideas, trends, and discussions."
                />
              )
            )}
          </div>

          {/* Floating Action Bar */}
          {selectedSuggestionIndices.size > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
                <span className="font-medium text-sm whitespace-nowrap">
                  {selectedSuggestionIndices.size} ideas selected
                </span>
                <div className="h-4 w-px bg-background/20" />

                <label className="flex items-center gap-2 text-sm text-background font-medium cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={autoClassify}
                    onChange={(e) => setAutoClassify(e.target.checked)}
                    className="rounded border-background/50 bg-transparent text-brand focus:ring-offset-background h-4 w-4"
                  />
                  Save & Classify
                </label>

                <div className="h-4 w-px bg-background/20" />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSuggestionIndices(new Set())}
                    className="text-sm text-background/70 hover:text-background transition-colors font-medium px-2 py-1"
                  >
                    Clear
                  </button>
                  <Button
                    size="sm"
                    className="rounded-full px-4 h-8 bg-background text-foreground hover:bg-background/90"
                    onClick={saveSelectedSuggestions}
                  >
                    {autoClassify ? 'Save & Run' : 'Save to Library'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === IDEAS TAB (Raw) === */}
      {tab === 'ideas' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Idea Library (Unclassified)</h3>
            </div>

            {rawLoading ? (
              <div className="text-center py-10 text-muted-foreground">Loading...</div>
            ) : rawTopics.length === 0 ? (
              <div className="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                We don&apos;t have any raw ideas yet. Go to <button onClick={() => setTab('research')} className="text-brand font-medium hover:underline">Research</button> to find some!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rawTopics.map((topic: any) => (
                  <Card key={topic.id} className="group hover:border-brand/30 transition-colors">
                    <CardContent className="p-5 flex gap-4 sm:gap-6">
                      <div className="flex-1 space-y-2">
                        <p className="text-foreground text-sm leading-relaxed">{topic.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">{topic.source}</Badge>
                          <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 justify-center border-l pl-6 border-border/50">
                        <div className="flex items-center gap-1 justify-center">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedRawId(topic.id);
                              // Small hack: direct classify without preview for speed, or open preview
                              // For now, let's just classify immediately to keep flow fast
                              classifyOne.mutate({
                                rawTopicId: topic.id,
                                topicContent: topic.content,
                                autoApprove: true
                              });
                            }}
                            disabled={classifyOne.isPending}
                          >
                            Classify
                          </Button>
                          <InfoTooltip content="Match this idea to your Content Pillars to generate a tailored post." side="left" className="h-4 w-4 text-muted-foreground/70" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteRaw(topic.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* === READY TAB (Classified) === */}
      {tab === 'ready' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section className="pt-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Classified Topics</h3>

              {/* Pillar Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button
                  onClick={() => setActivePillar('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    activePillar === 'all'
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  All Pillars
                </button>
                {pillars.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePillar(p.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      activePillar === p.id
                        ? "bg-foreground text-background"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {displayTopics.length === 0 ? (
              <div className="bg-card/50 border border-dashed border-border rounded-xl p-12 text-center">
                <EmptyState
                  icon={Layers}
                  headline="No classified topics"
                  description="Classify your raw ideas in the 'Idea Library' to assign them to pillars and unlock post generation."
                />
                <Button variant="link" onClick={() => setTab('ideas')} className="mt-2 text-brand">
                  Go to Idea Library
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayTopics.map((topic: any) => (
                  <Card key={topic.id} className="flex flex-col group hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium">
                          {topic.pillarName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Badge variant={topic.aiScore > 80 ? 'success' : 'neutral'} className="text-[10px]">
                            {topic.aiScore}/100
                          </Badge>
                          <InfoTooltip content={`Relevance score based on pillar: ${topic.pillarName}`} side="left" className="h-3 w-3" />
                        </div>
                      </div>

                      <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
                        {topic.content}
                      </p>

                      <div className="mt-auto pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={() => handleGenerate(topic)}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-2" />
                          Write Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
