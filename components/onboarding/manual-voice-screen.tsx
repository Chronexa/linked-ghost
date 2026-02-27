'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ManualVoiceScreenProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function ManualVoiceScreen({ onComplete, onSkip }: ManualVoiceScreenProps) {
    const [post1, setPost1] = useState('');
    const [post2, setPost2] = useState('');
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAnalyze() {
        const posts = [post1, post2].filter((p) => p.trim().length > 50);
        if (posts.length === 0) {
            toast.error('Please paste at least 1 LinkedIn post (50+ characters)');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/onboarding/analyze-manual-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    posts,
                    role: role.trim() || undefined,
                    industry: industry.trim() || undefined,
                    topics: [],
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Analysis failed');
            }

            toast.success('Voice style analyzed!');
            onComplete();
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C1502E] to-[#D4723C] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">
                    ✍️
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A1D]">
                    Show us how you write
                </h2>
                <p className="text-[#7A7A80] text-sm mt-1 max-w-md mx-auto">
                    Paste 1-2 of your best LinkedIn posts so we can match your unique writing style.
                </p>
            </div>

            {/* Quick identity fields */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-[#7A7A80]">Your Role</Label>
                    <Input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. VP of Engineering"
                        className="mt-1 text-sm"
                    />
                </div>
                <div>
                    <Label className="text-xs text-[#7A7A80]">Industry</Label>
                    <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. SaaS / FinTech"
                        className="mt-1 text-sm"
                    />
                </div>
            </div>

            {/* Post textareas */}
            <div className="space-y-4">
                <div>
                    <Label className="text-xs text-[#7A7A80] flex items-center gap-1">
                        <span className="text-green-500">●</span> Post 1 <span className="text-[#B0B0B5]">(required)</span>
                    </Label>
                    <Textarea
                        value={post1}
                        onChange={(e) => setPost1(e.target.value)}
                        placeholder="Paste your best LinkedIn post here…"
                        rows={6}
                        className="mt-1 text-sm resize-none"
                    />
                    <p className="text-[10px] text-[#B0B0B5] text-right mt-0.5">
                        {post1.length} characters {post1.length > 0 && post1.length < 50 && '(need 50+)'}
                    </p>
                </div>
                <div>
                    <Label className="text-xs text-[#7A7A80] flex items-center gap-1">
                        Post 2 <span className="text-[#B0B0B5]">(optional but improves accuracy)</span>
                    </Label>
                    <Textarea
                        value={post2}
                        onChange={(e) => setPost2(e.target.value)}
                        placeholder="Paste a second post for better voice matching…"
                        rows={6}
                        className="mt-1 text-sm resize-none"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <Button
                    onClick={handleAnalyze}
                    disabled={loading || post1.trim().length < 50}
                    className="w-full bg-[#C1502E] hover:bg-[#A3401F] text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-[#C1502E]/20"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Analyzing your style…
                        </span>
                    ) : (
                        'Analyze My Style →'
                    )}
                </Button>
                <button
                    onClick={onSkip}
                    className="w-full text-center text-xs text-[#B0B0B5] hover:text-[#7A7A80] transition-colors py-2"
                >
                    Skip for now — I will add posts later
                </button>
            </div>
        </div>
    );
}
