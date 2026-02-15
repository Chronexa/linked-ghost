'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Import standard Card components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Newspaper, TrendingUp, ChevronDown, ChevronUp, RefreshCw, Lightbulb, Sparkles } from 'lucide-react'; // Added icons
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface PerplexitySource {
  title: string;
  url: string;
  snippet?: string;
}

interface Topic {
  content: string;
  sources: PerplexitySource[];
  relevanceScore: number;
  trendingScore: number;
  summary: string;
  keyPoints?: string[];
  suggestedHashtags?: string[];
}

interface TopicCardsMessageProps {
  topics: Topic[];
  onSelect: (topic: string, sources: any[], userPerspective?: string) => void;
  onRegenerate?: (additionalInstructions?: string) => void | Promise<void>;
}

function truncateSummary(summary: string, maxLines = 2): string {
  const lines = summary.split('\n').filter(Boolean).slice(0, maxLines);
  return lines.join(' ').slice(0, 160) + (summary.length > 160 ? '…' : '');
}

export function TopicCardsMessage({ topics, onSelect, onRegenerate }: TopicCardsMessageProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [userPointsByIndex, setUserPointsByIndex] = useState<Record<number, string>>({});
  const [showAll, setShowAll] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const visibleTopics = showAll ? topics : topics.slice(0, 5);

  const handleSelect = (topic: Topic, idx: number) => {
    const points = userPointsByIndex[idx]?.trim();
    onSelect(topic.content, topic.sources, points || undefined);
  };

  const handleRegenerate = () => {
    if (!onRegenerate) return;
    setRegenerating(true);
    Promise.resolve(onRegenerate()).finally(() => setRegenerating(false));
  };

  return (
    <div className="flex w-full justify-start mb-8 animate-in fade-in duration-500">
      <div className="flex w-full items-start gap-4">
        <Avatar className="h-8 w-8 mt-1 border border-border shadow-sm shrink-0">
          <AvatarImage src="/ai-avatar.png" alt="AI" />
          <AvatarFallback className="bg-primary/5 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full gap-4 min-w-0 max-w-[calc(100%-48px)]">
          <div className="bg-transparent px-1 py-0 text-sm text-foreground/80 leading-relaxed">
            I found <span className="font-semibold text-foreground">{topics.length} trending topics</span> for you. Select one to start drafting, or add your customized angle.
          </div>

          <div className="space-y-3">
            {visibleTopics.map((topic, idx) => {
              const isExpanded = expandedId === idx;
              const summaryShort = truncateSummary(topic.summary);
              return (
                <Card
                  key={idx}
                  className={`
                    border border-border/60 shadow-sm transition-all duration-200 overflow-hidden group
                    ${isExpanded ? 'ring-1 ring-primary/20 bg-background' : 'hover:border-primary/30 hover:shadow-md bg-card/50'}
                  `}
                >
                  <div
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : idx)}
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-foreground font-display leading-tight">
                          {topic.content}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {topic.trendingScore > 75 && (
                          <Badge variant="success" className="text-[10px] px-2 py-0 h-5 font-medium bg-emerald-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-500/20">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        {topic.relevanceScore > 85 && (
                          <Badge variant="brand" className="text-[10px] px-2 py-0 h-5 font-medium bg-blue-500/10 text-blue-700 border-blue-200/50 hover:bg-blue-500/20">
                            <Sparkles className="w-3 h-3 mr-1" />
                            High Match
                          </Badge>
                        )}
                      </div>

                      {!isExpanded && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {summaryShort}
                        </p>
                      )}

                      {!isExpanded && topic.sources.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mt-1">
                          <Newspaper className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{topic.sources[0].title || 'Source'}</span>
                          {topic.sources.length > 1 && <span className="text-[10px]">+ {topic.sources.length - 1} more</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 pt-0.5">
                      <Button
                        size="sm"
                        variant={isExpanded ? "secondary" : "primary"} // Primary CTA when collapsed
                        className={`gap-1.5 shadow-sm transition-all ${isExpanded ? "bg-muted hover:bg-muted/80" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(topic, idx);
                        }}
                      >
                        Select <ChevronRight className="w-3 h-3 opacity-60" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : idx);
                        }}
                      >
                        {isExpanded ? 'Less' : 'Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                      <div className="pt-3 border-t border-border/40 space-y-4">
                        <div className="rounded-lg bg-muted/30 p-3">
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{topic.summary}</p>
                          {topic.keyPoints && topic.keyPoints.length > 0 && (
                            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                              {topic.keyPoints.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary/40 shrink-0" />
                                  <span className="flex-1">{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {topic.sources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {topic.sources.slice(0, 3).map((s, i) => (
                              <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all text-xs text-muted-foreground hover:text-primary max-w-[220px]"
                              >
                                <Newspaper className="w-3 h-3 shrink-0 opacity-70" />
                                <span className="truncate font-medium">{s.title || 'Read source'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Custom Perspective
                          </label>
                        </div>
                        <Textarea
                          placeholder="Add your unique take, personal story, or key message here..."
                          value={userPointsByIndex[idx] ?? ''}
                          onChange={(e) => setUserPointsByIndex((prev) => ({ ...prev, [idx]: e.target.value }))}
                          className="min-h-[80px] text-sm resize-none bg-background focus:bg-background transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(topic, idx);
                            }}
                            className="shadow-sm"
                          >
                            Generate Draft with my input <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {topics.length > 5 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:bg-muted/50"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? <><ChevronUp className="w-3 h-3 mr-1.5" /> Show less</> : <><ChevronDown className="w-3 h-3 mr-1.5" /> Show {topics.length - 5} more topics</>}
              </Button>
            </div>
          )}

          {onRegenerate && (
            <div className="flex justify-start pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs text-muted-foreground bg-background hover:bg-muted/50 border-dashed"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                Find different topics
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
