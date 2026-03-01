"use client";

import { motion, useReducedMotion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface GhostHeroProps {
    className?: string;
}

/**
 * Full animated Ghost Writer illustration for the hero section.
 * ViewBox cropped to `90 0 480 340` — tight around the ghost body + eyes.
 * - Float: 8px vertical, 4s ease-in-out
 * - Eyes: blink every 4-6s with random interval
 * - Pen arm: 2-3px left-right oscillation (scribbling)
 * - prefers-reduced-motion: all animation disabled
 * - will-change: transform for GPU acceleration
 */
export function GhostHero({ className = "" }: GhostHeroProps) {
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !prefersReducedMotion;
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });
    const [blinkKey, setBlinkKey] = useState(0);

    // Random blink interval: 4-6 seconds
    useEffect(() => {
        if (!shouldAnimate || !isInView) return;
        let timeout: NodeJS.Timeout;
        const scheduleBlink = () => {
            const delay = 4000 + Math.random() * 2000;
            timeout = setTimeout(() => {
                setBlinkKey((k) => k + 1);
                scheduleBlink();
            }, delay);
        };
        scheduleBlink();
        return () => clearTimeout(timeout);
    }, [shouldAnimate, isInView]);

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ willChange: shouldAnimate ? "transform" : "auto" }}
            animate={
                shouldAnimate && isInView
                    ? { y: [0, -8, 0] }
                    : { y: 0 }
            }
            transition={
                shouldAnimate
                    ? {
                        y: {
                            duration: 4,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop",
                        },
                    }
                    : undefined
            }
        >
            {/*
              viewBox="90 0 480 340": crops the original 591×397 canvas
              so the ghost fills the container properly instead of
              appearing tiny in one corner of a very wide SVG.
            */}
            <svg
                width="100%"
                height="100%"
                viewBox="90 0 480 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Ghost Writer mascot illustration"
                role="img"
            >
                {/* ===== GHOST BODY ===== */}
                <path
                    d="M566.244 274.112C566.244 274.112 440.244 287.077 423.744 282.112C407.244 277.147 385.714 258.844 381.744 223.112C376.244 173.612 443.244 104.612 427.744 56.112C417.517 24.1119 384.419 0.672156 342.744 2.61201C286.244 10.112 259.244 77.612 210.244 107.612C130.581 156.385 67.2439 223.112 99.7439 322.112L566.244 274.112Z"
                    fill="white"
                    stroke="#C44828"
                    strokeWidth="5"
                />

                {/* ===== PAPER (desk surface) ===== */}
                <path
                    d="M589.744 347.612L386.744 294.112L153.244 316.112L382.244 394.112L589.744 347.612Z"
                    fill="white"
                />
                <path
                    d="M153.244 316.112L382.244 394.112L589.744 347.612L386.744 294.112L153.244 316.112Z"
                    stroke="#C44828"
                    strokeWidth="5"
                    fill="none"
                />

                {/* ===== ARM + PEN (writing oscillation) ===== */}
                <motion.g
                    style={{ willChange: shouldAnimate ? "transform" : "auto" }}
                    animate={
                        shouldAnimate && isInView
                            ? { x: [0, 2.5, 0, -2.5, 0] }
                            : { x: 0 }
                    }
                    transition={
                        shouldAnimate
                            ? {
                                x: {
                                    duration: 0.8,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "loop",
                                },
                            }
                            : undefined
                    }
                >
                    {/* Arm + pen */}
                    <path
                        d="M353.846 311.112L226.244 179.612L363.244 302.608C363.244 302.608 366.641 301.649 371.744 303.612C378.244 306.112 393.744 342.612 393.744 342.612C393.744 342.612 360.244 323.612 355.744 320.112C352.267 317.407 353.846 311.112 353.846 311.112Z"
                        fill="white"
                        stroke="#C44828"
                        strokeWidth="2.5"
                    />
                    {/* Hand / writing area */}
                    <path
                        d="M313.744 259.112C300.744 260.612 232.604 267.209 206.244 254.612L173.244 288.112C180.712 308.353 202.744 320.612 230.744 327.612C252.744 326.112 284.111 323.661 332.244 296.612C341.747 293.251 350.616 299.74 357.744 292.612C366.244 284.112 335.198 256.636 313.744 259.112Z"
                        fill="white"
                        stroke="#C44828"
                        strokeWidth="2.5"
                    />
                </motion.g>

                {/* ===== EYES ===== */}
                {/* Left eye */}
                <motion.ellipse
                    key={`hero-l-${blinkKey}`}
                    cx="349.896"
                    cy="97.6984"
                    rx="9.59484"
                    ry="16.5"
                    transform="rotate(30.5666 349.896 97.6984)"
                    fill="#C44828"
                    animate={shouldAnimate && isInView ? { scaleY: [1, 0.05, 1] } : undefined}
                    transition={{ duration: 0.2, times: [0, 0.5, 1] }}
                    style={{
                        transformOrigin: "349.896px 97.6984px",
                        willChange: shouldAnimate ? "transform" : "auto",
                    }}
                />
                {/* Right eye */}
                <motion.ellipse
                    key={`hero-r-${blinkKey}`}
                    cx="386.896"
                    cy="116.698"
                    rx="9.59484"
                    ry="16.5"
                    transform="rotate(30.5666 386.896 116.698)"
                    fill="#C44828"
                    animate={shouldAnimate && isInView ? { scaleY: [1, 0.05, 1] } : undefined}
                    transition={{ duration: 0.2, times: [0, 0.5, 1] }}
                    style={{
                        transformOrigin: "386.896px 116.698px",
                        willChange: shouldAnimate ? "transform" : "auto",
                    }}
                />
            </svg>
        </motion.div>
    );
}
