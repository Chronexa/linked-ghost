"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { GhostReading } from '@/components/brand/ghost-reading';

export function ProblemSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="w-full bg-[#FAFAF7] py-32 relative overflow-hidden" aria-labelledby="problem-title">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 id="problem-title" className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Growing on LinkedIn is a full-time job.
                    </h2>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        Most professionals know they should post consistently. Almost none actually do.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "The blank page", desc: "You sit down to write and 45 minutes pass. Nothing." },
                        { title: "Running out of ideas", desc: "Week 3 hits and you've already repeated yourself twice." },
                        { title: "Generic output", desc: "AI tools give you posts that sound like everyone else." }
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.15, ease: "easeOut" }}
                            className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col"
                        >
                            <h3 className="font-semibold text-lg text-gray-900 mb-3">{card.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ambient ghost — peering over the problem cards, reading the situation */}
            <GhostReading className="absolute -bottom-6 right-4 md:right-12 w-[140px] md:w-[180px] opacity-[0.18] pointer-events-none select-none" />
        </section>
    );
}
