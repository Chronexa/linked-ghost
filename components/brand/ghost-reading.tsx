"use client";

import { motion, useReducedMotion } from 'framer-motion';

/**
 * GhostReading — ambient ghost illustration used in the Problem section.
 * Small, faded ghost peering over the cards as if reading.
 * Deliberately low opacity — personality, not decoration.
 */
export function GhostReading({ className = "" }: { className?: string }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            aria-hidden="true"
        >
            <motion.svg
                viewBox="90 0 480 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                animate={shouldReduceMotion ? undefined : {
                    y: [0, -6, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* Ghost body */}
                <path
                    d="M713 357.5C713 357.5 587 370.465 570.5 365.5C554 360.535 532.47 342.232 528.5 306.5C523 257 590 188 574.5 139.5C564.273 107.5 531.175 84.0602 489.5 86.0001C433 93.5 406 161 357 191C277.337 239.773 214 306.5 246.5 405.5L713 357.5Z"
                    fill="white"
                    stroke="#C44828"
                    strokeWidth="5"
                    strokeLinejoin="round"
                />

                {/* Paper/desk the ghost is looking at */}
                <path d="M736.5 431L533.5 377.5L300 399.5L529 477.5L736.5 431Z" fill="white" />
                <path
                    d="M300 399.5L529 477.5L736.5 431L533.5 377.5L300 399.5ZM300 399.5L147 414.5"
                    stroke="#C44828"
                    strokeWidth="5"
                />

                {/* Pen gesture */}
                <path
                    d="M500.603 394.5L373 263L510 385.996C510 385.996 513.397 385.037 518.5 387C525 389.5 540.5 426 540.5 426C540.5 426 507 407 502.5 403.5C499.023 400.795 500.603 394.5 500.603 394.5Z"
                    fill="white"
                />

                {/* Eyes */}
                <ellipse
                    cx="496.652"
                    cy="181.087"
                    rx="9.59484"
                    ry="16.5"
                    transform="rotate(30.5666 496.652 181.087)"
                    fill="#C44828"
                />
                <ellipse
                    cx="533.652"
                    cy="200.087"
                    rx="9.59484"
                    ry="16.5"
                    transform="rotate(30.5666 533.652 200.087)"
                    fill="#C44828"
                />
            </motion.svg>
        </motion.div>
    );
}
