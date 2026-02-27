"use client";

import { motion, useReducedMotion } from 'framer-motion';

export function TestimonialsSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="w-full bg-[#FAFAF7] py-32 border-t border-gray-100" aria-label="Testimonials">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        What creators are saying.
                    </h2>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <motion.div variants={{ hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm flex flex-col justify-between" role="article">
                        <div>
                            <div className="text-brand text-lg mb-6 tracking-widest" aria-label="5 stars">★★★★★</div>
                            <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                                "ContentPilot understands my voice better than I do."
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">SK</div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Sarah K.</div>
                                <div className="text-xs text-gray-500">Founder, B2B SaaS</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm flex flex-col justify-between" role="article">
                        <div>
                            <div className="text-brand text-lg mb-6 tracking-widest" aria-label="5 stars">★★★★★</div>
                            <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                                "The voice matching is scary good — my engagement tripled in 30 days."
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-sm">RM</div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Rahul M.</div>
                                <div className="text-xs text-gray-500">Management Consultant</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm flex flex-col justify-between" role="article">
                        <div>
                            <div className="text-brand text-lg mb-6 tracking-widest" aria-label="5 stars">★★★★★</div>
                            <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
                                "I look forward to reviewing my daily post drafts instead of staring at a blank page."
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-sm">JT</div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Jessica T.</div>
                                <div className="text-xs text-gray-500">Marketing Director</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
