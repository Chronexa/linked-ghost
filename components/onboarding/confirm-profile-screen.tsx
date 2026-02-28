'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check, ChevronRight } from 'lucide-react';

interface Pillar {
    id: string;
    name: string;
    description: string;
    emoji: string;
    exampleTopics: string[];
}

interface ConfirmProfileScreenProps {
    onConfirm: (confirmedPillarIds: string[], removedPillarIds: string[], archetype: string) => void;
}

const ARCHETYPES = [
    { id: 'expert', label: 'The Expert', description: 'Data-driven authority, shares research & insights', emoji: '🎓' },
    { id: 'storyteller', label: 'The Storyteller', description: 'Shares personal stories & experiences', emoji: '📖' },
    { id: 'contrarian', label: 'The Contrarian', description: 'Challenges conventional wisdom boldly', emoji: '🔥' },
    { id: 'educator', label: 'The Educator', description: 'Breaks down complex topics simply', emoji: '💡' },
];

export default function ConfirmProfileScreen({ onConfirm }: ConfirmProfileScreenProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pillars, setPillars] = useState<Pillar[]>([]);
    const [removedPillarIds, setRemovedPillarIds] = useState<string[]>([]);
    const [selectedArchetype, setSelectedArchetype] = useState('expert');
    const [voiceDna, setVoiceDna] = useState<any>(null);
    const [profileInfo, setProfileInfo] = useState<{ fullName: string; headline: string }>({
        fullName: '',
        headline: '',
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    async function loadProfileData() {
        try {
            const res = await fetch('/api/onboarding/scraper-status');
            if (!res.ok) throw new Error('Failed to load profile');
            const data = await res.json();

            setVoiceDna(data.voiceDna);
            setSelectedArchetype(data.voiceArchetype || 'expert');
            setProfileInfo({
                fullName: data.fullName || '',
                headline: data.linkedinHeadline || '',
            });

            const pillarsRes = await fetch('/api/pillars');
            if (pillarsRes.ok) {
                const pillarsData = await pillarsRes.json();
                const suggestedPillars = (pillarsData.pillars || pillarsData || [])
                    .filter((p: any) => p.status === 'suggested')
                    .map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || '',
                        emoji: p.emoji || '📝',
                        exampleTopics: p.exampleTopics || [],
                    }));
                setPillars(suggestedPillars);
            }
        } catch (err) {
            console.error('Failed to load profile data:', err);
        } finally {
            setLoading(false);
        }
    }

    function removePillar(pillarId: string) {
        setRemovedPillarIds((prev) => [...prev, pillarId]);
    }

    async function handleConfirm() {
        setSubmitting(true);
        const confirmedIds = pillars
            .filter((p) => !removedPillarIds.includes(p.id))
            .map((p) => p.id);
        onConfirm(confirmedIds, removedPillarIds, selectedArchetype);
    }

    const activePillars = pillars.filter(p => !removedPillarIds.includes(p.id));
    const isReady = !loading;

    return (
        <AnimatePresence mode="wait">
            {!isReady ? (
                <motion.div
                    key="loader"
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-saas-modal flex items-center justify-center"
                >
                    <svg className="w-10 h-10 animate-spin text-saas-brand/30" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="45" fill="none" stroke="var(--brand)" strokeWidth="8" strokeLinecap="round"
                            initial={{ strokeDasharray: "1 200", strokeDashoffset: 0 }}
                            animate={{ strokeDasharray: ["1 200", "90 150", "90 150"], strokeDashoffset: [0, -40, -120] }}
                            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                        />
                    </svg>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-2xl mx-auto space-y-10 pb-8"
                >
                    {/* Header: Avatar, Name & Headline */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-saas-surface border border-saas-border flex items-center justify-center shadow-saas-subtle overflow-hidden relative z-10">
                                <span className="text-3xl font-semibold text-saas-text-primary">
                                    {profileInfo.fullName ? profileInfo.fullName.charAt(0) : 'U'}
                                </span>
                            </div>
                            <div className="absolute -inset-1.5 rounded-full border border-saas-brand/30 animate-pulse" />
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-saas-background flex items-center justify-center shadow-lg z-20">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-saas-text-primary tracking-tight">
                                {profileInfo.fullName ? `Welcome, ${profileInfo.fullName.split(' ')[0]}` : 'Your profile is ready'}
                            </h1>
                            {profileInfo.headline && (
                                <p className="text-sm text-saas-text-secondary mt-1 max-w-md mx-auto leading-relaxed">
                                    {profileInfo.headline}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="space-y-8">
                            {/* Voice Style Summary */}
                            {voiceDna && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-saas-text-primary tracking-wide uppercase">
                                        Your Writing Style
                                    </h3>
                                    <div className="relative bg-saas-surface rounded-saas-xl p-5 border border-saas-border shadow-saas-subtle overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-saas-brand" />
                                        <p className="text-sm text-saas-text-secondary leading-relaxed mb-4">
                                            {voiceDna.analysisNotes || voiceDna.voicePersonality || 'Professional and engaging'}
                                        </p>

                                        {voiceDna.toneAttributes && voiceDna.toneAttributes.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {voiceDna.toneAttributes.map((attr: string) => (
                                                    <span
                                                        key={attr}
                                                        className="px-2.5 py-1 rounded-full bg-black/5 border border-black/5 text-xs text-saas-text-secondary hover:text-saas-text-primary hover:bg-black/10 transition-colors cursor-default"
                                                    >
                                                        {attr}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Voice Archetype Selection */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-saas-text-primary tracking-wide uppercase">
                                    Voice Archetype
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {ARCHETYPES.map((archetype) => {
                                        const isSelected = selectedArchetype === archetype.id;
                                        return (
                                            <button
                                                key={archetype.id}
                                                onClick={() => setSelectedArchetype(archetype.id)}
                                                className={`relative text-left p-4 rounded-saas-xl border transition-all duration-200 ease-out flex flex-col items-start gap-1 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus ${isSelected
                                                    ? 'bg-saas-brand/5 border-saas-brand/50 shadow-saas-glow'
                                                    : 'bg-saas-surface border-saas-border hover:border-saas-border-focus hover:scale-102'
                                                    }`}
                                            >
                                                {/* Selection Checkmark */}
                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            className="absolute top-3 right-3 text-saas-brand"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <span className="text-2xl mb-1">{archetype.emoji}</span>
                                                <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-saas-text-primary' : 'text-saas-text-primary'
                                                    }`}>
                                                    {archetype.label}
                                                </span>
                                                <p className="text-xs text-saas-text-tertiary">
                                                    {archetype.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-saas-text-primary tracking-wide uppercase">
                                    Content Pillars
                                </h3>
                                <span className="text-xs text-saas-text-tertiary bg-black/5 px-2 py-0.5 rounded-full border border-saas-border">
                                    {activePillars.length} Active
                                </span>
                            </div>

                            <div className="space-y-2">
                                <AnimatePresence initial={false}>
                                    {activePillars.map((pillar) => (
                                        <motion.div
                                            key={pillar.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className="group relative bg-saas-surface border border-saas-border rounded-saas-xl p-4 pr-12 transition-all hover:border-saas-border-focus flex items-start gap-3"
                                        >
                                            <span className="text-xl shrink-0 mt-0.5">{pillar.emoji}</span>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-medium text-saas-text-primary truncate">
                                                    {pillar.name}
                                                </h4>
                                                <p className="text-xs text-saas-text-secondary mt-0.5 line-clamp-2">
                                                    {pillar.description}
                                                </p>
                                            </div>

                                            {/* Remove Button (Hover) */}
                                            <button
                                                onClick={() => removePillar(pillar.id)}
                                                className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-lg text-saas-text-tertiary opacity-0 group-hover:opacity-100 hover:bg-black/5 hover:text-saas-text-primary transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus"
                                                title="Remove pillar"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Generic "Add More" Stub */}
                                <motion.button
                                    layout
                                    className="w-full h-14 border border-dashed border-saas-border hover:border-saas-text-tertiary rounded-saas-xl flex items-center justify-center gap-2 text-saas-text-tertiary hover:text-saas-text-primary transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add pillar in settings
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Massive CTA */}
                    <motion.div
                        layout
                        className="pt-6 border-t border-saas-border"
                    >
                        <Button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="w-full h-14 bg-gradient-to-b from-saas-brand-dark to-saas-brand hover:from-saas-brand-light hover:to-saas-brand-dark text-white rounded-saas-xl text-base font-semibold shadow-saas-medium hover:shadow-saas-glow hover:-translate-y-px transition-all duration-300 border border-white/20 border-b-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/80 border-t-white rounded-full animate-spin" />
                                    Formatting constraints...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Lock in Profile &amp; Start Writing <ChevronRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-xs text-saas-text-tertiary mt-4">
                            You can always update these preferences later in your settings.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
