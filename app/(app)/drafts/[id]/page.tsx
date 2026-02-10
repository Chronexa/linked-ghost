'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui';

// Mock data
const mockDraft = {
  id: '1',
  topicId: 't1',
  topic: {
    content:
      'AI agents are transforming customer service by reducing response times by 60%. Companies using AI-powered support see significant improvements.',
    url: 'https://example.com/ai-customer-service',
  },
  variantLetter: 'A',
  fullText:
    "AI agents aren't just the future—they're already here, revolutionizing customer service.\n\nCompanies using AI-powered support are seeing response times drop by 60%.\n\nBut here's what most people miss:\nIt's not about replacing humans. It's about empowering them to focus on complex problems that truly need human touch.\n\nThe best teams use AI to handle repetitive queries while their people tackle the interesting challenges.\n\nWhat's your take on AI in customer service? 🤔\n\n#AI #CustomerService #Innovation",
  characterCount: 447,
  status: 'draft' as const,
  pillarName: 'AI Innovation',
  createdAt: '2026-02-09T08:30:00Z',
};

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [editedText, setEditedText] = useState(mockDraft.fullText);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const characterCount = editedText.length;
  const isLinkedInOptimal = characterCount >= 800 && characterCount <= 1300;
  const isTooLong = characterCount > 3000;

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleApprove = async () => {
    router.push('/drafts');
  };

  const handleReject = async () => {
    router.push('/drafts');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link
        href="/drafts"
        className="inline-flex items-center text-charcoal-light hover:text-charcoal mb-6 transition font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Drafts
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                    <span className="text-white font-display font-bold">
                      {mockDraft.variantLetter}
                    </span>
                  </div>
                  <div>
                    <CardTitle>Variant {mockDraft.variantLetter}</CardTitle>
                    <Badge variant="success" className="mt-1">
                      {mockDraft.pillarName}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  variant="secondary"
                  size="sm"
                >
                  Save Changes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Post Content"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={15}
                placeholder="Edit your LinkedIn post here..."
                className="font-sans"
              />

              {/* Character Count */}
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <span
                    className={`font-medium ${
                      isLinkedInOptimal
                        ? 'text-success'
                        : isTooLong
                        ? 'text-error'
                        : 'text-charcoal-light'
                    }`}
                  >
                    {characterCount} characters
                  </span>
                  {isLinkedInOptimal && (
                    <span className="text-success text-xs font-medium">✓ Optimal length</span>
                  )}
                  {isTooLong && (
                    <span className="text-error text-xs font-medium">⚠ Too long</span>
                  )}
                </div>
                <div className="text-charcoal-light text-xs">
                  LinkedIn max: 3,000 • Optimal: 800-1,300
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <Textarea
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes or feedback about this draft..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handleReject}
              variant="secondary"
              className="border-error text-error hover:bg-error/5"
            >
              Reject Draft
            </Button>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowScheduler(!showScheduler)}
                variant="secondary"
              >
                Schedule for Later
              </Button>
              <Button onClick={handleApprove} size="lg">
                Approve & Publish
              </Button>
            </div>
          </div>

          {/* Scheduler */}
          {showScheduler && (
            <Card className="mt-4 bg-brand/5 border-brand/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="input"
                    />
                  </div>
                  <Button size="sm" className="mt-6">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Original Topic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Original Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-light leading-relaxed mb-3">
                {mockDraft.topic.content}
              </p>
              {mockDraft.topic.url && (
                <a
                  href={mockDraft.topic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-text hover:text-brand truncate block"
                >
                  View source →
                </a>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Hook Type:</span>
                  <span className="font-medium text-charcoal">Opening Question</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Tone:</span>
                  <span className="font-medium text-charcoal">Conversational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Best Time:</span>
                  <span className="font-medium text-charcoal">Tue 9-11 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full px-4 py-2.5 bg-background text-charcoal rounded-lg text-sm font-medium hover:bg-border/20 transition text-left flex items-center">
                  <span className="mr-2">↻</span> Regenerate with different tone
                </button>
                <button className="w-full px-4 py-2.5 bg-background text-charcoal rounded-lg text-sm font-medium hover:bg-border/20 transition text-left flex items-center">
                  <span className="mr-2">📋</span> Copy to clipboard
                </button>
                <button className="w-full px-4 py-2.5 bg-background text-charcoal rounded-lg text-sm font-medium hover:bg-border/20 transition text-left flex items-center">
                  <span className="mr-2">📊</span> Preview engagement
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-light">Current version</span>
                  <span className="text-charcoal font-medium">v1</span>
                </div>
                <div className="text-xs text-charcoal-light">
                  Created {new Date(mockDraft.createdAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
