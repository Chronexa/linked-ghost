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
    cta: '',
    positioning: '',
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
      setFormData({ name: '', description: '', tone: '', targetAudience: '', cta: '', positioning: '' });
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
      cta: pillar.cta || '',
      positioning: pillar.positioning || '',
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
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-charcoal tracking-tight">Content Pillars</h1>
          <p className="text-charcoal-light mt-2 text-lg">Organize your content by themes and topics</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', description: '', tone: '', targetAudience: '', cta: '', positioning: '' });
          }}
          size="lg"
          className="shadow-warm"
        >
          + Add Pillar
        </Button>
      </div>

      {/* Form Modal */}
      {/* Form Modal */}
      {showForm && (
        <Card className="mb-8 border border-border/60 shadow-warm bg-surface/50 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl">{editingId ? 'Edit Pillar' : 'Create New Pillar'}</CardTitle>
            <p className="text-charcoal-light text-sm">
              Define a core theme for your content strategy.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Pillar Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., AI Innovation, Founder Journey"
                required
                className="bg-background"
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What topics does this pillar cover?"
                rows={3}
                className="bg-background"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Content Voice"
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g., professional, casual"
                  className="bg-background"
                />

                <Input
                  label="Target Audience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Tech founders"
                  className="bg-background"
                />

                <Input
                  label="Positioning"
                  type="text"
                  value={formData.positioning}
                  onChange={(e) => setFormData({ ...formData, positioning: e.target.value })}
                  placeholder="e.g., The Expert"
                  className="bg-background"
                />

                <Input
                  label="Ending CTA"
                  type="text"
                  value={formData.cta}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                  placeholder="e.g., Subscribe to newsletter"
                  className="bg-background"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/50">
                <Button type="button" onClick={() => setShowForm(false)} variant="secondary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPillar.isPending || updatePillar.isPending}
                  isLoading={createPillar.isPending || updatePillar.isPending}
                  loadingText="Saving..."
                >
                  {editingId ? 'Update Pillar' : 'Create Pillar'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar: any) => (
            <Card key={pillar.id} className="group hover:shadow-warm hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-card/50 hover:bg-card hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-xl font-display font-bold">{pillar.name}</CardTitle>
                    <Badge variant={pillar.status === 'active' ? 'success' : 'neutral'}>
                      {pillar.status}
                    </Badge>
                  </div>
                </div>
                {pillar.description && (
                  <p className="text-charcoal-light text-sm leading-relaxed">{pillar.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  {pillar.tone && (
                    <div>
                      <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Content Voice</label>
                      <p className="text-sm text-charcoal mt-1 line-clamp-2">{pillar.tone}</p>
                    </div>
                  )}

                  {pillar.targetAudience && (
                    <div>
                      <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">
                        Target Audience
                      </label>
                      <p className="text-sm text-charcoal mt-1 line-clamp-2">{pillar.targetAudience}</p>
                    </div>
                  )}

                  {pillar.positioning && (
                    <div>
                      <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">
                        Positioning
                      </label>
                      <p className="text-sm text-charcoal mt-1 line-clamp-2">{pillar.positioning}</p>
                    </div>
                  )}

                  {pillar.cta && (
                    <div>
                      <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">
                        Ending CTA
                      </label>
                      <p className="text-sm text-charcoal mt-1 line-clamp-2">{pillar.cta}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="text-xs font-medium text-charcoal-light bg-secondary/50 px-2.5 py-1 rounded-md">
                    <span className="font-bold text-primary">{pillar.postsCount || 0}</span> posts
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleToggleStatus(pillar)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-success hover:bg-success/10"
                      title={pillar.status === 'active' ? 'Deactivate' : 'Activate'}
                      disabled={updatePillar.isPending}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Button>
                    <Button
                      onClick={() => handleEdit(pillar)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      onClick={() => handleDelete(pillar.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={deletePillar.isPending}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
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
