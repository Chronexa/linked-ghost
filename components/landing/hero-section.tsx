"use client";

import Link from 'next/link';
import { Button } from '@/components/ui';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Play, X } from 'lucide-react';

export function HeroSection() {
    const [demoState, setDemoState] = useState(0);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isActive = true;

        const runCycle = () => {
            if (!isActive) return;
            setDemoState(0);

            setTimeout(() => { if (isActive) setDemoState(1); }, 500);
            setTimeout(() => { if (isActive) setDemoState(2); }, 1500);
            setTimeout(() => { if (isActive) setDemoState(3); }, 4000);

            timeoutId = setTimeout(() => {
                if (isActive) runCycle();
            }, 6000);
        };

        runCycle();

        return () => {
            isActive = false;
            clearTimeout(timeoutId);
        };
    }, []);

    const generatedText = "Hot take: Most compliance advice will slow your international growth. Here's what the new RBI update actually means for NRI founders...";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: shouldReduceMotion ? 0 : 0.02 }
        }
    };

    const charVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <>
            {/* Video Demo Modal */}
            <AnimatePresence>
                {showVideoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                        onClick={() => setShowVideoModal(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Product Demo Video"
                    >
                        <motion.div
                            initial={{ scale: shouldReduceMotion ? 1 : 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: shouldReduceMotion ? 1 : 0.92, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                aria-label="Close demo video"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                            {/* Placeholder — replace src with your real Loom/YouTube embed URL */}
                            <div className="w-full aspect-video bg-[#0F0F12] flex flex-col items-center justify-center text-white gap-4">
                                <div className="w-16 h-16 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center">
                                    <Play className="w-7 h-7 text-brand fill-brand ml-1" aria-hidden="true" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-lg mb-1">Product Demo Coming Soon</p>
                                    <p className="text-gray-400 text-sm">Replace this with your Loom or YouTube embed</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="container mx-auto px-6 pt-24 pb-32" aria-label="Hero">
                <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Copy */}
                    <div className="text-left text-gray-900">
                        <h1 className="font-display text-5xl md:text-[52px] font-bold mb-6 leading-[1.15] tracking-tight">
                            Your next LinkedIn post.<br />
                            In your voice.<br />
                            In 3 minutes.
                        </h1>

                        <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">
                            LinkedIn Ghostwriter AI researches trending topics in your niche, learns your writing style, and generates ready-to-post drafts — every day.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Link href="/sign-up" aria-label="Start Free Trial">
                                <Button size="lg" className="px-8 text-base bg-brand text-white hover:bg-brand/90 w-full sm:w-auto h-12">
                                    Start Free Trial &rarr;
                                </Button>
                            </Link>
                            <button
                                onClick={() => setShowVideoModal(true)}
                                className="inline-flex items-center justify-center gap-2.5 px-8 text-base border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto h-12 rounded-lg transition-colors font-medium"
                                aria-label="Watch product demo video"
                            >
                                <Play className="w-4 h-4 fill-gray-400 text-gray-400" aria-hidden="true" />
                                Watch Demo
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 font-medium tracking-wide">
                            7-day free trial · No credit card required · Setup in 5 min
                        </div>
                    </div>

                    {/* Right Column: Animated Product Demo */}
                    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto lg:max-w-none" aria-hidden="true">
                        <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">

                            {/* Browser Chrome */}
                            <div className="h-10 border-b border-gray-100 bg-gray-50 flex items-center px-4 space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="mx-auto flex-1 max-w-[200px] bg-white border border-gray-200 rounded text-[10px] text-gray-400 text-center py-1">
                                    linkedinghostwriter-ai.com/create
                                </div>
                                <div className="w-10"></div>
                            </div>

                            {/* Demo Content Area */}
                            <div className="flex-1 p-6 bg-[#FAFAFA] relative overflow-hidden">

                                {/* Topic Card (Steps 1+) */}
                                <AnimatePresence>
                                    {demoState >= 1 && (
                                        <motion.div
                                            initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                                                    Trending Topic
                                                </span>
                                                <span className="text-xs text-gray-400">via News</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                RBI changes cross-border payment limits for tech startups
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Post Generation Box (Steps 2+) */}
                                <AnimatePresence>
                                    {demoState >= 2 && (
                                        <motion.div
                                            initial={{ scale: shouldReduceMotion ? 1 : 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm min-h-[120px] relative"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                                                    CP
                                                </div>
                                                <div className="text-xs font-semibold text-gray-600">Drafting variant 1...</div>
                                            </div>

                                            <motion.div
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="text-sm text-gray-700 leading-relaxed"
                                            >
                                                {generatedText.split('').map((char, index) => (
                                                    <motion.span key={index} variants={charVariants}>
                                                        {char}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Success Badge (Steps 3+) */}
                                <AnimatePresence>
                                    {demoState >= 3 && (
                                        <motion.div
                                            initial={{ y: shouldReduceMotion ? 0 : 20, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute bottom-6 right-6 bg-green-50 border border-green-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-green-700"
                                        >
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            Voice match: 94% · Generated in 2.3s
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
