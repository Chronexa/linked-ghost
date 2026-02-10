'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge } from '@/components/ui';

// Mock data
const mockPillars = [
  {
    id: '1',
    name: 'AI Innovation',
    slug: 'ai_innovation',
    description: 'Latest trends and breakthroughs in artificial intelligence',
    tone: 'forward-thinking, analytical, optimistic',
    targetAudience: 'Tech leaders, AI enthusiasts, startup founders',
    status: 'active' as const,
    postsCount: 12,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Leadership',
    slug: 'leadership',
    description: 'Team management, culture building, and leadership insights',
    tone: 'authentic, empathetic, actionable',
    targetAudience: 'Managers, executives, aspiring leaders',
    status: 'active' as const,
    postsCount: 8,
    createdAt: '2026-01-15T10:05:00Z',
  },
  {
    id: '3',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Tools, techniques, and strategies for working smarter',
    tone: 'practical, data-driven, encouraging',
    targetAudience: 'Knowledge workers, entrepreneurs, productivity enthusiasts',
    status: 'active' as const,
    postsCount: 15,
    createdAt: '2026-01-15T10:10:00Z',
  },
  {
    id: '4',
    name: 'Founder Journey',
    slug: 'founder_journey',
    description: 'Personal stories and lessons from building a startup',
    tone: 'vulnerable, honest, inspiring',
    targetAudience: 'Entrepreneurs, startup founders, aspiring founders',
    status: 'inactive' as const,
    postsCount: 3,
    createdAt: '2026-01-20T14:00:00Z',
  },
];

export default function PillarsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: '',
    targetAudience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating pillar:', formData);
    setShowForm(false);
    setFormData({ name: '', description: '', tone: '', targetAudience: '' });
  };

  const handleEdit = (pillar: typeof mockPillars[0]) => {
    setEditingId(pillar.id);
    setFormData({
      name: pillar.name,
      description: pillar.description || '',
      tone: pillar.tone || '',
      targetAudience: pillar.targetAudience || '',
    });
    setShowForm(true);
  };

  const handleToggleStatus = (id: string) => {
    console.log('Toggle status for:', id);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Content Pillars</h1>
          <p className="text-charcoal-light mt-1">
            Organize your content by themes and topics
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', description: '', tone: '', targetAudience: '' });
          }}
        >
          + Add Pillar
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="mb-6 border-2 border-brand shadow-warm">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Pillar' : 'Create New Pillar'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Pillar Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., AI Innovation, Founder Journey"
                required
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What topics does this pillar cover?"
                rows={3}
              />

              <Input
                label="Tone & Style"
                type="text"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                placeholder="e.g., professional, casual, inspiring"
              />

              <Input
                label="Target Audience"
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Tech founders, marketing professionals"
              />

              <div className="flex items-center space-x-3 pt-4">
                <Button type="submit">
                  {editingId ? 'Update Pillar' : 'Create Pillar'}
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

      {/* Pillars Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockPillars.map((pillar) => (
          <Card key={pillar.id} hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{pillar.name}</CardTitle>
                  <Badge variant={pillar.status === 'active' ? 'success' : 'neutral'}>
                    {pillar.status}
                  </Badge>
                </div>
              </div>
              {pillar.description && (
                <p className="text-charcoal-light text-sm mt-2">{pillar.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {pillar.tone && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-charcoal-light">Tone:</label>
                  <p className="text-sm text-charcoal mt-1">{pillar.tone}</p>
                </div>
              )}

              {pillar.targetAudience && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-charcoal-light">Target Audience:</label>
                  <p className="text-sm text-charcoal mt-1">{pillar.targetAudience}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-charcoal-light">
                  <span className="font-semibold text-charcoal">{pillar.postsCount}</span> posts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(pillar.id)}
                    className="p-2 text-charcoal-light hover:text-success hover:bg-success/5 rounded transition"
                    title={pillar.status === 'active' ? 'Deactivate' : 'Activate'}
                    aria-label={pillar.status === 'active' ? 'Deactivate pillar' : 'Activate pillar'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(pillar)}
                    className="p-2 text-charcoal-light hover:text-brand hover:bg-brand/5 rounded transition"
                    aria-label="Edit pillar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockPillars.length === 0 && (
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
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="font-medium text-charcoal mb-2">No content pillars yet</p>
            <p className="text-charcoal-light text-sm mb-6">
              Create your first content pillar to start organizing your posts
            </p>
            <Button onClick={() => setShowForm(true)}>
              Create Your First Pillar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
