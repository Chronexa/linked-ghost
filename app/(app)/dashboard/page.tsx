'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

// Mock data for pending topics
const mockTopics = [
  {
    id: 1,
    title: 'AI agents are transforming customer service by reducing response times',
    source: 'perplexity' as const,
    suggestedPillar: 'AI Innovation',
    score: 92,
  },
  {
    id: 2,
    title: 'Reddit discussion: Best practices for remote team collaboration',
    source: 'reddit' as const,
    suggestedPillar: 'Leadership',
    score: 85,
  },
  {
    id: 3,
    title: 'New study shows 70% increase in productivity with AI tools',
    source: 'manual' as const,
    suggestedPillar: 'Productivity',
    score: 88,
  },
  {
    id: 4,
    title: 'The rise of no-code platforms is democratizing software development',
    source: 'perplexity' as const,
    suggestedPillar: 'Tech Trends',
    score: 78,
  },
  {
    id: 5,
    title: 'How startups are leveraging AI for competitive advantage',
    source: 'reddit' as const,
    suggestedPillar: 'Entrepreneurship',
    score: 91,
  },
];

// Mock data for generated drafts
const mockDrafts = [
  {
    id: 'A',
    text: "AI agents aren't just the future—they're already here, revolutionizing customer service. Companies using AI-powered support are seeing response times drop by 60%. But here's what most people miss: it's not about replacing humans, it's about empowering them to focus on complex problems that truly need human touch...",
    charCount: 847,
  },
  {
    id: 'B',
    text: "Let me tell you something that surprised me about AI in customer service: The best implementations aren't trying to replace humans. Last week, I analyzed 50+ companies using AI agents. The winners? They use AI to handle repetitive queries while their team tackles the interesting challenges...",
    charCount: 923,
  },
  {
    id: 'C',
    text: "Here's a truth bomb about AI in customer service: 60% reduction in response times. 40% increase in customer satisfaction. But the real magic? Your team finally gets to do meaningful work instead of answering \"Where's my order?\" for the 1000th time. AI agents are handling the repetitive stuff...",
    charCount: 891,
  },
];

const getSourceBadge = (source: 'perplexity' | 'reddit' | 'manual') => {
  const variants = {
    perplexity: 'brand',
    reddit: 'warning',
    manual: 'neutral',
  } as const;
  return variants[source];
};

export default function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
          Welcome back!
        </h1>
        <p className="text-charcoal-light">
          You have <span className="font-semibold text-brand">{mockTopics.length} topics</span> pending classification and <span className="font-semibold text-success">{mockDrafts.length} drafts</span> ready to review.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-brand mb-1">{mockTopics.length}</div>
            <div className="text-sm text-charcoal-light">Pending Topics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success mb-1">{mockDrafts.length}</div>
            <div className="text-sm text-charcoal-light">Generated Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-charcoal mb-1">12</div>
            <div className="text-sm text-charcoal-light">Posts This Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-charcoal mb-1">87%</div>
            <div className="text-sm text-charcoal-light">Avg Quality Score</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Pending Topics (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              Pending Topics
            </h2>
            <Link href="/topics">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>

          {mockTopics.map((topic) => (
            <Card 
              key={topic.id}
              hover
              className={selectedTopic === topic.id ? 'ring-2 ring-brand' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-charcoal leading-relaxed flex-1 line-clamp-2">
                    {topic.title}
                  </p>
                  <div className="flex items-center ml-2">
                    <svg className="w-4 h-4 text-warning mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-charcoal">{topic.score}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSourceBadge(topic.source)}>
                      {topic.source}
                    </Badge>
                    <Badge variant="success">
                      {topic.suggestedPillar}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockTopics.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light">No pending topics</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Generated Drafts (60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              Generated Drafts
            </h2>
            <Link href="/drafts">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>

          {mockDrafts.map((draft) => (
            <Card key={draft.id} hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                      <span className="text-white font-display font-bold text-sm">
                        {draft.id}
                      </span>
                    </div>
                    <CardTitle className="text-base">Variant {draft.id}</CardTitle>
                  </div>
                  <span className="text-xs text-charcoal-light">
                    {draft.charCount} chars
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-charcoal-light leading-relaxed line-clamp-3 mb-4">
                  {draft.text}
                </p>
                <div className="flex items-center space-x-2">
                  <Link href={`/drafts/${draft.id.toLowerCase()}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1">
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockDrafts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light mb-4">No drafts yet</p>
                <Button onClick={() => setSelectedTopic(mockTopics[0]?.id)}>
                  Generate Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-charcoal-light">
                <span className="font-semibold text-brand">{mockTopics.length}</span> topics pending
              </span>
              <span className="text-charcoal-light">
                <span className="font-semibold text-success">{mockDrafts.length}</span> drafts ready
              </span>
            </div>
            <span className="text-charcoal-light">
              Last sync: <span className="font-medium text-charcoal">2 hours ago</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
