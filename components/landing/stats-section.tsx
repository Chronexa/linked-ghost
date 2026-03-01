"use client";

import { motion, useReducedMotion } from 'framer-motion';

const stats = [
    { value: "2,400+", label: "Posts generated" },
    { value: "< 3 min", label: "Average time to draft" },
    { value: "50+", label: "Professionals using it" },
    { value: "92%", label: "Voice match accuracy" },
];

export function StatsSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section
            className="w-full bg-white border-y border-gray-100 py-14"
            aria-label="Product Statistics"
        >
            <div className="container mx-auto px-6 max-w-[1100px]">
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : i * 0.1 }}
                            className="text-center md:border-r md:border-gray-100 last:border-0 px-4"
                        >
                            <dt className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </dt>
                            <dd className="text-sm text-gray-500 font-medium">{stat.label}</dd>
                        </motion.div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
