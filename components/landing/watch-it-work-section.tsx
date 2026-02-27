"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

export function WatchItWorkSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="w-full bg-[#0F0F12] py-32 overflow-hidden" aria-label="Watch It Work Demonstration">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="text-center mb-24">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Watch it work.
                    </h2>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row items-center justify-center max-w-5xl mx-auto gap-8 relative"
                    aria-hidden="true" // Screen readers won't read the visual animation
                >
                    {/* Topic Card */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -50 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="w-full md:w-1/3 bg-[#1A1A1D] border border-gray-800 p-6 rounded-2xl shadow-xl flex-shrink-0 relative z-10"
                    >
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Input</div>
                        <div className="bg-[#242429] p-5 rounded-xl border border-gray-700">
                            <p className="text-gray-300 font-medium text-sm leading-relaxed">Topic: How transparency impacts B2B sales cycles.</p>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#1A1A1D]">You</div>
                            <div className="text-xs font-medium text-gray-400">Target Voice</div>
                        </div>
                    </motion.div>

                    {/* Arrow */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.5 },
                            visible: { opacity: 1, scale: 1, transition: { delay: shouldReduceMotion ? 0 : 0.4, duration: 0.4 } }
                        }}
                        className="text-gray-600 rotate-90 md:rotate-0 flex-shrink-0 z-0"
                    >
                        <ArrowRight className="w-8 h-8" />
                    </motion.div>

                    {/* Post Generation */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 50 },
                            visible: { opacity: 1, x: 0, transition: { delay: shouldReduceMotion ? 0 : 0.8, duration: 0.6, ease: "easeOut" } }
                        }}
                        className="w-full md:w-2/3 bg-white p-8 md:p-10 rounded-2xl shadow-2xl relative z-10"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">You</div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Your Name</div>
                                <div className="text-[11px] font-medium text-gray-400 mt-0.5">Just now</div>
                            </div>
                        </div>
                        <motion.div
                            variants={{
                                hidden: { opacity: 1 },
                                visible: { opacity: 1, transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05, delayChildren: shouldReduceMotion ? 0 : 1.5 } }
                            }}
                            className="text-gray-800 leading-relaxed text-[15px] min-h-[140px]"
                        >
                            {"B2B buyers don't want to be sold to. They want to be guided.\n\nWe started publishing our pricing and roadmap publicly last year. Everyone said we were crazy. The result?\n\nOur sales cycle dropped by 34%.\n\nTransparency isn't a marketing tactic. It's a filter that qualifies your best customers before you ever get on a call.".split('').map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                                    className={char === '\n' ? 'block mb-2' : ''}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.5, y: shouldReduceMotion ? 0 : 20 },
                                visible: { opacity: 1, scale: 1, y: 0, transition: { delay: shouldReduceMotion ? 0 : 3.2, type: "spring", stiffness: 200, damping: 20 } }
                            }}
                            className="absolute -bottom-5 -right-5 bg-green-50 text-green-700 border border-green-200 px-5 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-[13px]"
                        >
                            <Check className="w-4 h-4" strokeWidth={3} />
                            Voice match: 94%
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
