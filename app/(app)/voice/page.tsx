'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Badge } from '@/components/ui';
import { useVoiceExamples, useAddVoiceExample, useDeleteVoiceExample, useAnalyzeVoice } from '@/lib/hooks/use-voice';
import { usePillars } from '@/lib/hooks/use-pillars';
import { useUser } from '@/lib/hooks/use-user';
import { formatRelativeTime } from '@/lib/utils';

export default function VoicePage() {
  const [showForm, setShowForm] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');

  // Fetch data from APIs
  const { data: examplesData, isLoading: examplesLoading } = useVoiceExamples();
  const { data: pillarsData } = usePillars({ status: 'active' });
  const { data: userData } = useUser();

  const addExample = useAddVoiceExample();
  const deleteExample = useDeleteVoiceExample();
  const analyzeVoice = useAnalyzeVoice();

  const examples = examplesData?.data?.data || [];
  const pillars = pillarsData?.data?.data || [];
  const profile = userData?.data?.profile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPostText.trim().length < 50) {
      return;
    }

    try {
      await addExample.mutateAsync({
        postText: newPostText,
        pillarId: selectedPillar || undefined,
      });
      
      setNewPostText('');
      setSelectedPillar('');
      setShowForm(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAnalyze = async () => {
    if (examples.length < 3) {
      return;
    }
    
    try {
      await analyzeVoice.mutateAsync();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this example?')) {
      try {
        await deleteExample.mutateAsync(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const confidenceScore = profile?.voiceConfidenceScore || 0;
  const hasEnoughExamples = examples.length >= 3;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
          Voice Training
        </h1>
        <p className="text-charcoal-light">
          Train the AI on your writing style by providing examples of your best LinkedIn posts.
        </p>
      </div>

      {/* Voice Confidence Score */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Voice Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-charcoal-light mb-1">Confidence Score</div>
              <div className="text-3xl font-bold text-brand">{confidenceScore}%</div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!hasEnoughExamples || analyzeVoice.isPending}
              variant={hasEnoughExamples ? 'default' : 'secondary'}
            >
              {analyzeVoice.isPending ? 'Analyzing...' : 'Analyze Voice'}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>

          {/* Status message */}
          <p className="text-sm text-charcoal-light">
            {confidenceScore >= 90 && 'Excellent! Your voice profile is well-trained and consistent.'}
            {confidenceScore >= 80 && confidenceScore < 90 && 'Great voice profile! Consider adding 1-2 more examples for even better results.'}
            {confidenceScore >= 70 && confidenceScore < 80 && 'Good voice profile. Add 2-3 more examples for improved consistency.'}
            {confidenceScore >= 60 && confidenceScore < 70 && 'Fair voice profile. Add 3-5 more examples and ensure they match your writing style.'}
            {confidenceScore < 60 && examples.length < 3 && 'Add at least 3-5 high-quality LinkedIn posts to train your voice.'}
            {confidenceScore < 60 && examples.length >= 3 && 'Voice examples are inconsistent. Review your examples and ensure they represent your authentic writing style.'}
          </p>

          {profile?.lastVoiceTrainingAt && (
            <p className="text-xs text-charcoal-light mt-2">
              Last trained: {new Date(profile.lastVoiceTrainingAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Examples List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Voice Examples ({examples.length})
          </h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Example'}
          </Button>
        </div>

        {/* Add Example Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Voice Example</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    LinkedIn Post Text *
                  </label>
                  <Textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Paste your LinkedIn post here... (minimum 50 characters)"
                    rows={8}
                    required
                  />
                  <p className="text-xs text-charcoal-light mt-1">
                    {newPostText.length} characters
                    {newPostText.length < 50 && newPostText.length > 0 && (
                      <span className="text-warning ml-2">
                        (minimum 50 characters required)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Content Pillar (Optional)
                  </label>
                  <select
                    value={selectedPillar}
                    onChange={(e) => setSelectedPillar(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  >
                    <option value="">Select a pillar...</option>
                    {pillars.map((pillar: any) => (
                      <option key={pillar.id} value={pillar.id}>
                        {pillar.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={newPostText.trim().length < 50 || addExample.isPending}
                    className="flex-1"
                  >
                    {addExample.isPending ? 'Adding...' : 'Add Example'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setNewPostText('');
                      setSelectedPillar('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Examples List */}
        <div className="space-y-4">
          {examplesLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light">Loading voice examples...</p>
              </CardContent>
            </Card>
          ) : examples.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light mb-4">
                  No voice examples yet. Add 3-5 examples of your best LinkedIn posts.
                </p>
                <Button onClick={() => setShowForm(true)}>Add Your First Example</Button>
              </CardContent>
            </Card>
          ) : (
            examples.map((example: any) => (
              <Card key={example.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-base">Voice Example</CardTitle>
                      {example.pillarName && (
                        <Badge variant="neutral">{example.pillarName}</Badge>
                      )}
                      <Badge variant="success">{example.status}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(example.id)}
                      disabled={deleteExample.isPending}
                    >
                      {deleteExample.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-charcoal-light leading-relaxed whitespace-pre-wrap mb-4">
                    {example.postText}
                  </p>
                  <div className="flex items-center justify-between text-xs text-charcoal-light">
                    <span>{example.characterCount} characters</span>
                    <span>Added {formatRelativeTime(new Date(example.createdAt))}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Help Text */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold text-charcoal mb-3">Tips for Better Voice Training</h3>
          <ul className="space-y-2 text-sm text-charcoal-light">
            <li className="flex items-start">
              <span className="text-brand mr-2">•</span>
              <span>Add 5-10 examples of your best-performing LinkedIn posts</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">•</span>
              <span>Choose posts that represent your authentic voice and style</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">•</span>
              <span>Include a mix of topics across your content pillars</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">•</span>
              <span>Longer posts (200+ characters) work better for voice analysis</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">•</span>
              <span>Click "Analyze Voice" after adding 3+ examples to see your confidence score</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
