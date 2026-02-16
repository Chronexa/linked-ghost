import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Check, Edit2, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface Draft {
    id: string;
    variantLetter: string;
    fullText: string;
    voiceMatchScore?: number;
    style?: string;
    characterCount: number;
    qualityWarnings?: string[];
}

const DRAFT_TEXT_MIN = 50;
const DRAFT_TEXT_MAX = 3000;

interface DraftVariantsMessageProps {
    drafts: Draft[];
    onRegenerate: () => void;
    onSelect?: (draft: Draft) => void;
    onSave?: (draftId: string, fullText: string) => Promise<void>;
    isRegenerating?: boolean;
    topicId?: string | null;
}

export function DraftVariantsMessage({ drafts, onRegenerate, onSelect, onSave, isRegenerating, topicId }: DraftVariantsMessageProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');
    const [savedOverrides, setSavedOverrides] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Always use the first draft (Single Draft Mode)
    const currentDraft = drafts[0];

    if (!currentDraft) {
        return null;
    }

    const getDisplayText = (draft: Draft) => savedOverrides[draft.id] ?? draft.fullText;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Draft copied to clipboard');
    };

    const handleEditStart = (draft: Draft) => {
        setEditingId(draft.id);
        setEditedText(getDisplayText(draft));
    };

    const handleEditSave = async () => {
        if (editedText.length < DRAFT_TEXT_MIN) {
            toast.error(`Draft must be at least ${DRAFT_TEXT_MIN} characters`);
            return;
        }
        if (editedText.length > DRAFT_TEXT_MAX) {
            toast.error(`Draft must be at most ${DRAFT_TEXT_MAX} characters`);
            return;
        }
        if (!editingId) return;
        if (onSave) {
            setSaving(true);
            try {
                await onSave(editingId, editedText);
                setSavedOverrides(prev => ({ ...prev, [editingId]: editedText }));
                setEditingId(null);
                toast.success('Draft saved');
            } catch {
                toast.error('Failed to save draft');
            } finally {
                setSaving(false);
            }
        } else {
            setEditingId(null);
            toast.success('Edit saved');
        }
    };

    return (
        <div className="flex w-full justify-start mb-8">
            <div className="flex w-full max-w-[95%] items-start gap-4">
                <div className="flex flex-col w-full gap-5">
                    <Card className="border-border/60 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between space-y-0 px-5 pt-4">
                            <div className="space-y-1">
                                <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <span className="text-primary">{currentDraft.style || 'Standard'} Style</span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {getDisplayText(currentDraft).length} chars
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {editingId === currentDraft.id ? (
                                <div className="p-4 space-y-3 bg-background">
                                    <Textarea
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="min-h-[300px] text-sm leading-relaxed resize-y border-border focus-visible:ring-1 focus-visible:ring-primary/20 font-normal"
                                        spellCheck={false}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs" disabled={saving}>Cancel</Button>
                                        <Button size="sm" onClick={() => handleEditSave()} className="h-8 text-xs" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="whitespace-pre-wrap text-sm leading-relaxed cursor-text p-6 hover:bg-muted/10 transition-colors font-normal text-foreground/90 selection:bg-primary/10"
                                    onClick={() => handleEditStart(currentDraft)}
                                    title="Click to edit text"
                                >
                                    {getDisplayText(currentDraft)}
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 px-5 bg-muted/20 border-t border-border/50">
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleCopy(getDisplayText(currentDraft))} className="h-8 text-xs bg-background hover:bg-accent border shadow-sm">
                                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleEditStart(currentDraft)} className="h-8 text-xs hover:bg-accent">
                                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                                    </Button>
                                </div>
                                <Button size="sm" onClick={() => onSelect?.(currentDraft)} className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                                    Open Editor <Edit2 className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs hover:text-foreground transition-colors" onClick={onRegenerate} disabled={isRegenerating || !topicId}>
                            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', isRegenerating && 'animate-spin')} /> Regenerate with different angle
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
