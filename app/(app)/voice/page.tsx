'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

// Mock data
const mockVoiceExamples = [
  {
    id: '1',
    postText:
      "Here's a truth bomb about building startups: 90% of your initial assumptions will be wrong.\n\nI learned this the hard way after pivoting 3 times in my first year.\n\nThe winners aren't the ones with the best first idea. They're the ones who listen, adapt, and move fast.\n\nWhat's the biggest assumption you had to challenge in your journey? 👇",
    characterCount: 312,
    pillarName: 'Founder Journey',
    status: 'active' as const,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: '2',
    postText:
      'AI is changing how we work. But here\'s what most people get wrong:\n\nIt\'s not about replacing jobs. It\'s about augmenting human capability.\n\nLast week, our team used GPT-4 to analyze 10,000 customer feedback responses in 2 hours. That would have taken us 2 weeks manually.\n\nThe result? We shipped 3 new features our customers actually wanted.\n\nThe question isn\'t "Will AI replace me?"\nThe question is "How can I use AI to 10x my impact?"\n\n#AI #FutureOfWork',
    characterCount: 487,
    pillarName: 'AI Innovation',
    status: 'active' as const,
    createdAt: '2026-01-22T14:30:00Z',
  },
  {
    id: '3',
    postText:
      'Productivity tip: Stop measuring your day by hours worked.\n\nStart measuring by problems solved.\n\nI used to work 12-hour days and feel exhausted.\nNow I work 6-hour focused blocks and get 2x more done.\n\nThe secret? Time blocking + ruthless prioritization.\n\nWork smarter, not harder.',
    characterCount: 287,
    pillarName: 'Productivity',
    status: 'active' as const,
    createdAt: '2026-01-25T09:15:00Z',
  },
];

export default function VoicePage() {
  const [showForm, setShowForm] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pillars = ['AI Innovation', 'Leadership', 'Productivity', 'Founder Journey'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowForm(false);
      setNewPostText('');
      setSelectedPillar('');
    }, 2000);
  };

  const handleAnalyzeVoice = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const activeExamples = mockVoiceExamples.filter((ex) => ex.status === 'active');
  const voiceConfidence = 92;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Voice Training</h1>
          <p className="text-charcoal-light mt-1">
            Train the AI to match your authentic writing style
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Example
        </Button>
      </div>

      {/* Voice Confidence Card */}
      <Card className="mb-6 bg-gradient-to-r from-brand to-brand-light border-0">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Voice Match Confidence</h3>
              <p className="text-white/80 text-sm">
                Based on {activeExamples.length} training examples
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold font-display">{voiceConfidence}%</div>
              <div className="text-white/80 text-sm mt-1">Excellent</div>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${voiceConfidence}%` }}
            />
          </div>
          <Button
            onClick={handleAnalyzeVoice}
            isLoading={isAnalyzing}
            loadingText="Analyzing..."
            variant="secondary"
            size="sm"
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
          >
            ↻ Reanalyze Voice
          </Button>
        </CardContent>
      </Card>

      {/* Add Example Form */}
      {showForm && (
        <Card className="mb-6 border-2 border-brand shadow-warm">
          <CardHeader>
            <CardTitle>Add Voice Training Example</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                label="LinkedIn Post"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Paste a LinkedIn post that represents your writing style..."
                rows={8}
                required
                helperText={`${newPostText.length} characters • ${
                  newPostText.length >= 100 ? '✓ Good length' : 'Minimum 100 characters'
                }`}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Content Pillar (optional)
                </label>
                <select
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value)}
                  className="select"
                >
                  <option value="">No specific pillar</option>
                  {pillars.map((pillar) => (
                    <option key={pillar} value={pillar}>
                      {pillar}
                    </option>
                  ))}
                </select>
              </div>

              <Card className="bg-brand/5 border-brand/20">
                <CardContent className="p-4">
                  <p className="text-sm text-charcoal-light">
                    <span className="font-semibold text-brand-text">💡 Tip:</span> Add 5-10 examples for best results.
                    Include posts with different styles, lengths, and topics.
                  </p>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  type="submit"
                  isLoading={isAnalyzing}
                  loadingText="Analyzing..."
                  disabled={newPostText.length < 100}
                >
                  Add Example
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Voice Examples List */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-charcoal">
          Training Examples ({activeExamples.length})
        </h2>

        {mockVoiceExamples.map((example) => (
          <Card key={example.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="success">
                    {example.pillarName}
                  </Badge>
                  <span className="text-xs text-charcoal-light">{example.characterCount} chars</span>
                </div>
                <button 
                  className="text-charcoal-light hover:text-error transition"
                  aria-label="Delete example"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-light text-sm leading-relaxed whitespace-pre-wrap">
                {example.postText}
              </p>
              <div className="text-xs text-charcoal-light mt-3">
                Added {formatRelativeTime(example.createdAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockVoiceExamples.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <svg
              className="w-16 h-16 text-charcoal-light/40 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="font-medium text-charcoal mb-2">No voice examples yet</p>
            <p className="text-charcoal-light text-sm mb-6">
              Add 3-5 of your best LinkedIn posts so AI can learn your writing style
            </p>
            <Button onClick={() => setShowForm(true)}>
              Add Your First Example
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
