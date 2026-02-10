'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
} from '@/components/ui';
import {
  usePillars,
  useCreatePillar,
  useUpdatePillar,
  useDeletePillar,
} from '@/lib/hooks/use-pillars';

export default function PillarsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: '',
    targetAudience: '',
  });

  // Fetch pillars from API
  const { data: pillarsData, isLoading } = usePillars({});
  const createPillar = useCreatePillar();
  const updatePillar = useUpdatePillar();
  const deletePillar = useDeletePillar();

  const pillars = pillarsData?.data?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updatePillar.mutateAsync({
          id: editingId,
          data: formData,
        });
      } else {
        await createPillar.mutateAsync(formData);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', tone: '', targetAudience: '' });
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleEdit = (pillar: any) => {
    setEditingId(pillar.id);
    setFormData({
      name: pillar.name,
      description: pillar.description || '',
      tone: pillar.tone || '',
      targetAudience: pillar.targetAudience || '',
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (pillar: any) => {
    const newStatus = pillar.status === 'active' ? 'inactive' : 'active';
    try {
      await updatePillar.mutateAsync({
        id: pillar.id,
        data: { status: newStatus },
      });
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pillar? This action cannot be undone.')) {
      try {
        await deletePillar.mutateAsync(id);
      } catch (error) {
        // Error handled by hooks
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Content Pillars</h1>
          <p className="text-charcoal-light mt-1">Organize your content by themes and topics</p>
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
                <Button
                  type="submit"
                  disabled={createPillar.isPending || updatePillar.isPending}
                >
                  {createPillar.isPending || updatePillar.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Pillar'
                    : 'Create Pillar'}
                </Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-charcoal-light">Loading pillars...</p>
          </CardContent>
        </Card>
      )}

      {/* Pillars Grid */}
      {!isLoading && pillars.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar: any) => (
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
                    <label className="text-xs font-medium text-charcoal-light">
                      Target Audience:
                    </label>
                    <p className="text-sm text-charcoal mt-1">{pillar.targetAudience}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-charcoal-light">
                    <span className="font-semibold text-charcoal">{pillar.postsCount || 0}</span>{' '}
                    posts
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(pillar)}
                      className="p-2 text-charcoal-light hover:text-success hover:bg-success/5 rounded transition"
                      title={pillar.status === 'active' ? 'Deactivate' : 'Activate'}
                      aria-label={
                        pillar.status === 'active' ? 'Deactivate pillar' : 'Activate pillar'
                      }
                      disabled={updatePillar.isPending}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(pillar)}
                      className="p-2 text-charcoal-light hover:text-brand hover:bg-brand/5 rounded transition"
                      aria-label="Edit pillar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(pillar.id)}
                      className="p-2 text-charcoal-light hover:text-error hover:bg-error/5 rounded transition"
                      aria-label="Delete pillar"
                      disabled={deletePillar.isPending}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pillars.length === 0 && (
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
            <Button onClick={() => setShowForm(true)}>Create Your First Pillar</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
