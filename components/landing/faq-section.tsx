"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        q: "How is LinkedIn Ghostwriter AI different from ChatGPT?",
        a: "ChatGPT generates generic content from a blank prompt — it has no idea how you write, what your audience cares about, or what topics are trending right now. LinkedIn Ghostwriter AI builds a persistent voice profile from your past posts, researches trending topics in your niche daily, and generates content specifically calibrated to sound like you. The average match score across all users is 94%.",
    },
    {
        q: "Will LinkedIn flag or penalize my account for using AI-assisted content?",
        a: "No. LinkedIn's terms of service do not prohibit AI assistance — only spam, automation, or bulk actions. ContentPilot generates drafts that you review, edit, and post manually, just like any writing aid. Millions of professionals use tools like Grammarly, Hemingway, and AI assistants without any issues.",
    },
    {
        q: "How long does it take for the AI to learn my voice?",
        a: "You can train a basic voice profile in under 10 minutes using 5–10 of your past posts. The more examples you provide, the more accurate the match. Most users see a 90%+ match score after entering 10–15 representative posts.",
    },
    {
        q: "What if I don't have any existing LinkedIn posts to train from?",
        a: "No problem. You can describe your tone and style in plain language during setup (e.g., 'direct, data-driven, first-person, short sentences'). You can also add written examples from emails, Slack messages, or anything you've written that represents how you naturally communicate.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes, completely. Cancel from your billing settings in one click — no emails, no forms, no questions asked. You keep access until the end of your current billing period.",
    },
];

export function FaqSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <section className="w-full bg-white py-24 border-t border-gray-100" aria-label="Frequently Asked Questions">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        Common questions.
                    </h2>
                </div>

                <div className="space-y-2" role="list">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden" role="listitem">
                            <button
                                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                                className="w-full text-left flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                                aria-expanded={openIdx === i}
                            >
                                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                                <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                    {openIdx === i
                                        ? <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                                        : <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                    }
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {openIdx === i && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-6 text-gray-600 leading-relaxed text-[15px]">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
