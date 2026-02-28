"use client";

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, FileText, Search, Users } from 'lucide-react';

export function HowItWorksSection() {
    const [activeTab, setActiveTab] = useState(0);
    const [isHoveringTabs, setIsHoveringTabs] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (isHoveringTabs) return;
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, [isHoveringTabs]);

    return (
        <section id="how-it-works" className="w-full bg-white py-32 border-y border-gray-100" aria-label="How LinkedIn Ghostwriter Works">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        From zero to ready-to-post in under 3 minutes.
                    </h2>
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
                    onMouseEnter={() => setIsHoveringTabs(true)}
                    onMouseLeave={() => setIsHoveringTabs(false)}
                >
                    {/* Tabs List */}
                    <div className="col-span-1 md:col-span-5 flex overflow-x-auto md:flex-col gap-4 md:gap-2 pb-4 md:pb-0 scrollbar-hide snap-x" role="tablist">
                        {[
                            { title: "1 — Discover", desc: "AI finds trending topics from news, Reddit, and your industry automatically." },
                            { title: "2 — Personalize", desc: "It learns your writing voice from your past LinkedIn posts." },
                            { title: "3 — Generate", desc: "Get 3 post variants per topic, ready to review and publish." }
                        ].map((tab, idx) => (
                            <button
                                key={idx}
                                role="tab"
                                aria-selected={activeTab === idx}
                                onClick={() => setActiveTab(idx)}
                                className={`text-left p-6 w-72 md:w-auto flex-shrink-0 snap-start rounded-2xl transition-all duration-300 ${activeTab === idx
                                    ? "bg-blue-50/50 border border-blue-100 shadow-sm"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                            >
                                <h3 className={`font-semibold text-xl mb-2 ${activeTab === idx ? "text-brand" : "text-gray-900"}`}>
                                    {tab.title}
                                </h3>
                                <p className={`text-sm leading-relaxed ${activeTab === idx ? "text-blue-900/70" : "text-gray-500"}`}>
                                    {tab.desc}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Visualization */}
                    <div className="col-span-1 md:col-span-7 relative h-[420px] w-full max-w-lg mx-auto md:max-w-none" aria-hidden="true">
                        <AnimatePresence mode="wait">
                            {activeTab === 0 && (
                                <motion.div
                                    key="tab0"
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-[#FAFAFA] rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-center"
                                >
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Today's Topics</h4>
                                    <div className="space-y-4">
                                        {[
                                            { title: "RBI rules for startups", src: "News", icon: FileText },
                                            { title: "AI agents replacing workflows", src: "Reddit", icon: Search },
                                            { title: "B2B SaaS churn rates 2026", src: "LinkedIn", icon: Users }
                                        ].map((item, i) => {
                                            const Icon = item.icon;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: shouldReduceMotion ? 0 : i * 0.15 + 0.1, duration: 0.4 }}
                                                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                                                            <Icon className="w-4 h-4" aria-hidden="true" />
                                                        </div>
                                                        <span className="font-medium text-gray-800 text-sm">{item.title}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-brand uppercase bg-brand/10 px-2.5 py-1 rounded">{item.src}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 1 && (
                                <motion.div
                                    key="tab1"
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-[#FAFAFA] rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-center"
                                >
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Voice Profile</h4>
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 font-medium">Tone: Direct & Analytical</span><span className="text-brand font-bold">92%</span></div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ delay: 0.2, duration: 1, ease: "easeOut" }} className="h-full bg-brand" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 font-medium">Style: First-person</span><span className="text-blue-500 font-bold">85%</span></div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ delay: 0.4, duration: 1, ease: "easeOut" }} className="h-full bg-blue-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-2">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                                <Check className="w-5 h-5" aria-hidden="true" />
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-semibold text-gray-900">Avg sentence: 12 words</div>
                                                <div className="text-gray-500 text-xs mt-0.5">Short, punchy structure detected</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === 2 && (
                                <motion.div
                                    key="tab2"
                                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-[#FAFAFA] rounded-2xl border border-gray-200 p-8 shadow-sm flex items-center justify-center overflow-hidden"
                                >
                                    <div className="relative w-full max-w-sm h-full flex items-center justify-center">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : 30 }}
                                                animate={{
                                                    opacity: i === 1 ? 1 : 0.4,
                                                    scale: i === 1 ? 1 : 0.85,
                                                    x: i === 0 ? -60 : i === 2 ? 60 : 0,
                                                    y: i === 1 ? -10 : 20,
                                                    zIndex: i === 1 ? 10 : 1
                                                }}
                                                transition={{ delay: shouldReduceMotion ? 0 : 0.2 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                                                className={`absolute w-full bg-white rounded-xl border ${i === 1 ? 'border-brand shadow-xl' : 'border-gray-200 shadow-sm'} p-6`}
                                            >
                                                {i === 1 && <div className="absolute -top-3 right-4 bg-brand text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md z-20">Best Match</div>}
                                                <div className="h-2.5 w-1/3 bg-gray-200 rounded mb-5"></div>
                                                <div className="space-y-3 mb-5">
                                                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                    <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                                                    <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
                                                </div>
                                                <div className="h-9 w-28 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"></div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
