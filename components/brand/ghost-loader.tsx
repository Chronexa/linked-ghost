"use client";

import { motion, useReducedMotion } from "framer-motion";

interface GhostLoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

const sizeMap = {
    sm: { width: 48, fontSize: "text-xs" },
    md: { width: 80, fontSize: "text-sm" },
    lg: { width: 120, fontSize: "text-base" },
};

/**
 * Reusable ghost loading spinner. Ghost floats with pen oscillating.
 * Three dots animate below to indicate "writing in progress."
 */
export function GhostLoader({ size = "md", text, className = "" }: GhostLoaderProps) {
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !prefersReducedMotion;
    const { width, fontSize } = sizeMap[size];

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <motion.div
                style={{ width, willChange: shouldAnimate ? "transform" : "auto" }}
                animate={shouldAnimate ? { y: [0, -6, 0] } : undefined}
                transition={
                    shouldAnimate
                        ? { duration: 2.5, ease: "easeInOut", repeat: Infinity }
                        : undefined
                }
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 90"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Loading"
                    role="img"
                >
                    {/* Simplified ghost body */}
                    <path
                        d="M78 62C78 62 56 64 52 63C48 62 43 57 42 48C40.5 38 53 25 50 15C48 8 44 2 38 2.5C30 3.5 26 16 16 22C5 29 -2 43 4 63L78 62Z"
                        fill="white"
                        stroke="#C44828"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                    {/* Left eye */}
                    <ellipse cx="39" cy="28" rx="3" ry="5" transform="rotate(25 39 28)" fill="#C44828" />
                    {/* Right eye */}
                    <ellipse cx="50" cy="32" rx="3" ry="5" transform="rotate(25 50 32)" fill="#C44828" />

                    {/* Pen arm — oscillates */}
                    <motion.g
                        style={{ willChange: shouldAnimate ? "transform" : "auto" }}
                        animate={shouldAnimate ? { x: [0, 2, 0, -2, 0] } : undefined}
                        transition={
                            shouldAnimate
                                ? { duration: 0.6, ease: "easeInOut", repeat: Infinity }
                                : undefined
                        }
                    >
                        {/* Simplified arm + pen */}
                        <line x1="45" y1="50" x2="62" y2="72" stroke="#C44828" strokeWidth="2" strokeLinecap="round" />
                        <line x1="62" y1="72" x2="68" y2="78" stroke="#C44828" strokeWidth="2.5" strokeLinecap="round" />
                    </motion.g>

                    {/* Paper line */}
                    <line x1="20" y1="80" x2="90" y2="76" stroke="#C44828" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </motion.div>

            {/* Writing dots animation */}
            <div className="flex items-center gap-1">
                {text && <span className={`text-gray-500 ${fontSize}`}>{text}</span>}
                <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className={`inline-block w-1 h-1 rounded-full bg-[#C44828] ${fontSize}`}
                            animate={shouldAnimate ? { opacity: [0.3, 1, 0.3] } : undefined}
                            transition={
                                shouldAnimate
                                    ? {
                                        duration: 1.2,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                    }
                                    : undefined
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
