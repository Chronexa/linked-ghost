'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dna, LayoutTemplate, Sparkles, Check } from 'lucide-react';

interface ScraperLoadingScreenProps {
    onSuccess: () => void;
    onFailed: () => void;
}

const POLL_INTERVAL = 2000;
const MAX_WAIT = 150000;

const LOADING_STEPS = [
    { id: 'scrape', label: 'Scanning your LinkedIn posts', icon: Search },
    { id: 'analyze', label: 'Analyzing your writing style', icon: Dna },
    { id: 'pillars', label: 'Discovering your content themes', icon: LayoutTemplate },
    { id: 'build', label: 'Building your AI ghostwriter', icon: Sparkles },
];

export default function ScraperLoadingScreen({ onSuccess, onFailed }: ScraperLoadingScreenProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [postsFound, setPostsFound] = useState(0);
    const startTime = useRef(Date.now());

    useEffect(() => {
        // Animate through steps progressively
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < LOADING_STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 12000);

        // Poll for scraper status
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/onboarding/scraper-status');
                if (!res.ok) return;

                const data = await res.json();

                if (data.postsFound > 0) {
                    setPostsFound(data.postsFound);
                }

                if (data.scraperStatus === 'success') {
                    clearInterval(pollInterval);
                    clearInterval(stepInterval);
                    setCurrentStep(LOADING_STEPS.length - 1);
                    setTimeout(onSuccess, 800);
                    return;
                }

                if (data.scraperStatus === 'failed') {
                    clearInterval(pollInterval);
                    clearInterval(stepInterval);
                    onFailed();
                    return;
                }
            } catch {
                // Ignore network errors but continue to check failsafe
            }

            if (Date.now() - startTime.current > MAX_WAIT) {
                clearInterval(pollInterval);
                clearInterval(stepInterval);
                onFailed();
                return;
            }
        }, POLL_INTERVAL);

        return () => {
            clearInterval(pollInterval);
            clearInterval(stepInterval);
        };
    }, [onSuccess, onFailed]);

    return (
        <div className="relative min-h-saas-modal flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-saas-2xl bg-saas-surface border border-saas-border shadow-saas-strong w-full max-w-lg mx-auto">

            {/* Animated Gradient Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-saas-2xl">
                <div
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-saas-brand/5 blur-saas-huge rounded-full animate-marquee"
                    style={{ animationDuration: '15s', animationDirection: 'alternate' }}
                />
                <div
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-saas-brand-dark/5 blur-saas-massive rounded-full animate-marquee"
                    style={{ animationDuration: '20s', animationDirection: 'alternate-reverse' }}
                />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center py-12">
                {/* Custom Brand Spinner */}
                <div className="relative mb-8 flex justify-center items-center">
                    <svg className="w-16 h-16 animate-spin text-saas-brand/20" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="var(--brand)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "1 200", strokeDashoffset: 0 }}
                            animate={{
                                strokeDasharray: ["1 200", "90 150", "90 150"],
                                strokeDashoffset: [0, -40, -120]
                            }}
                            transition={{
                                duration: 2,
                                ease: "easeInOut",
                                repeat: Infinity
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-saas-text-primary font-bold text-xl tracking-tighter">CP</span>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-saas-text-primary tracking-tight mb-2">
                    Orchestrating AI
                </h2>
                <p className="text-saas-text-secondary text-sm mb-10 max-w-sm">
                    We're analyzing your digital footprint to construct your personalized writing engine.
                </p>

                {/* Staggered Step List */}
                <div className="w-full max-w-sm space-y-1">
                    {LOADING_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;
                        const isPending = index > currentStep;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{
                                    opacity: isPending ? 0.4 : 1,
                                    y: 0
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.15,
                                    ease: "easeOut"
                                }}
                                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-saas-lg transition-all duration-300 ${isActive ? 'bg-black/5 shadow-saas-subtle' : ''
                                    }`}
                            >
                                {/* Active Accent Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-accent"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-saas-brand rounded-r-md"
                                    />
                                )}

                                {/* Icon / Checkmark */}
                                <div className="relative flex items-center justify-center w-6 h-6">
                                    <AnimatePresence mode="popLayout">
                                        {isCompleted ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-emerald-500"
                                            >
                                                <Check className="w-5 h-5" />
                                            </motion.div>
                                        ) : isActive ? (
                                            <motion.div
                                                key="active-icon"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-saas-brand"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="pending-icon"
                                                className="text-saas-text-tertiary"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <span className={`text-sm tracking-wide ${isActive ? 'text-saas-text-primary font-medium' : isCompleted ? 'text-saas-text-secondary' : 'text-saas-text-tertiary'}`}>
                                    {step.label}
                                    {isActive && <span className="animate-pulse">...</span>}
                                </span>

                                {/* Pulsing dot for active step */}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-saas-brand/80 animate-ping" style={{ animationDuration: '2s' }} />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Optional Data Metric */}
                <AnimatePresence>
                    {postsFound > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-4 border-t border-saas-border/50 w-full max-w-sm"
                        >
                            <p className="text-xs text-saas-text-tertiary">
                                Distilling <span className="font-semibold text-saas-text-primary">{postsFound} posts</span> into pure VoiceDNA™
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
