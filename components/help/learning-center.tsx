"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import {
    BookOpen,
    Lightbulb,
    Layers,
    Search,
    Target,
    Bot,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
    id: string;
    title: string;
    icon: any;
    content: React.ReactNode;
}

const ARTICLES: Article[] = [
    {
        id: "content-funnel",
        title: "The Content Funnel",
        icon: Target,
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    The Content Funnel is our strategy to ensure you never face &quot;Blank Page Syndrome&quot; again. It consists of four simple steps:
                </p>
                <ol className="list-decimal pl-4 space-y-2 marker:text-foreground font-medium">
                    <li>
                        <span className="text-foreground">Research</span>:
                        <span className="font-normal text-muted-foreground ml-1">Find raw ideas from the web (Perplexity/Reddit).</span>
                    </li>
                    <li>
                        <span className="text-foreground">Library</span>:
                        <span className="font-normal text-muted-foreground ml-1">Save the best ideas to your backlog.</span>
                    </li>
                    <li>
                        <span className="text-foreground">Classify</span>:
                        <span className="font-normal text-muted-foreground ml-1">Match ideas to your Pillars using AI.</span>
                    </li>
                    <li>
                        <span className="text-foreground">Write</span>:
                        <span className="font-normal text-muted-foreground ml-1">Generate high-quality posts instantly.</span>
                    </li>
                </ol>
            </div>
        )
    },
    {
        id: "pillars",
        title: "What are Content Pillars?",
        icon: Layers,
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    Content Pillars are the 3-5 core themes your personal brand is built upon. They act as &quot;buckets&quot; for your ideas.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Examples:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Founder Stories & Lessons</li>
                        <li>AI Industry News</li>
                        <li>Sales Tactics</li>
                    </ul>
                </div>
                <p>
                    Instead of posting random thoughts, every post you write should belong to one of these pillars. This builds authority and audience trust.
                </p>
            </div>
        )
    },
    {
        id: "research",
        title: "Using Research & Discovery",
        icon: Search,
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    The **Research** tab is your personal search engine for content ideas.
                </p>
                <p>
                    When you search for a topic (e.g. &quot;B2B Marketing&quot;), we pull real-time data from the web (via Perplexity). These results are **ephemeral**—they don&apos;t save to your database automatically.
                </p>
                <p>
                    **Best Practice**: Treat this like a brainstorming session. Scan 10-20 ideas, select the 2-3 gems that spark inspiration, and save them to your Library.
                </p>
            </div>
        )
    },
    {
        id: "classification",
        title: "Why Classify Topics?",
        icon: Bot,
        content: (
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                    Classification is the &quot;Magic&quot; step. It connects a raw idea to your strategy.
                </p>
                <p>
                    When you classify a topic, our AI analyzes it against your **Content Pillars** to see where it fits best. It assigns:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>A **Relevance Score** (0-100)</li>
                    <li>A specific **Angle** (e.g. Contrarian, Storytelling)</li>
                    <li>Key talking points</li>
                </ul>
                <p>
                    This ensures that when you finally click &quot;Write Post&quot;, the AI has all the context it needs to write like *you*.
                </p>
            </div>
        )
    }
];

interface LearningCenterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultArticleId?: string;
}

export function LearningCenter({ open, onOpenChange, defaultArticleId }: LearningCenterProps) {
    const [expandedId, setExpandedId] = useState<string | null>(defaultArticleId || null);

    return (
        <SlideOver
            open={open}
            onClose={() => onOpenChange(false)}
            title="Help & Guides"
            description="Master the workflow and build better content."
        >
            <div className="space-y-4">
                {ARTICLES.map((article) => {
                    const isExpanded = expandedId === article.id;
                    return (
                        <div
                            key={article.id}
                            className={cn(
                                "border rounded-xl transition-all duration-200 overflow-hidden",
                                isExpanded ? "border-brand bg-brand/5" : "border-border bg-card hover:border-brand/30"
                            )}
                        >
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : article.id)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isExpanded ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"
                                    )}>
                                        <article.icon className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        isExpanded ? "text-brand" : "text-foreground"
                                    )}>
                                        {article.title}
                                    </span>
                                </div>
                                <ChevronRight className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90 text-brand"
                                )} />
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="pt-4 border-t border-brand/10">
                                        {article.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="mt-8 p-4 bg-muted/30 rounded-xl text-center">
                    <Lightbulb className="w-6 h-6 text-brand mx-auto mb-2" />
                    <h3 className="font-medium text-foreground text-sm">Need more help?</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                        Contact us at support@contentpilot.ai for personalized onboarding.
                    </p>
                </div>
            </div>
        </SlideOver>
    );
}
