"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface GhostLogoProps {
    size?: number;
    animate?: boolean;
    className?: string;
}

/**
 * Ghost logo — uses the real brand SVG with the blue glow halo.
 * Eyes blink randomly every 4-6 seconds. Subtle float on hover.
 */
export function GhostLogo({ size = 32, animate = true, className = "" }: GhostLogoProps) {
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = animate && !prefersReducedMotion;
    const [blinkKey, setBlinkKey] = useState(0);

    useEffect(() => {
        if (!shouldAnimate) return;
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
    }, [shouldAnimate]);

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 853 725"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ willChange: shouldAnimate ? "transform" : "auto" }}
            whileHover={shouldAnimate ? { y: -2, transition: { duration: 0.3 } } : undefined}
            aria-label="LinkedIn Ghostwriter AI logo"
        >
            {/* Blue glow halo behind the ghost */}
            <g filter="url(#ghost-logo-glow)">
                <ellipse cx="426.5" cy="362.5" rx="226.5" ry="162.5" fill="#AFD5EF" fillOpacity="0.8" />
            </g>

            {/* Ghost body */}
            <path
                d="M713 357.5C713 357.5 587 370.465 570.5 365.5C554 360.535 532.47 342.232 528.5 306.5C523 257 590 188 574.5 139.5C564.273 107.5 531.175 84.0602 489.5 86.0001C433 93.5 406 161 357 191C277.337 239.773 214 306.5 246.5 405.5L713 357.5Z"
                fill="white"
                stroke="#C44828"
                strokeWidth="5"
            />

            {/* Ghost arm/pen trail */}
            <path d="M736.5 431L533.5 377.5L300 399.5L529 477.5L736.5 431Z" fill="white" />
            <path
                d="M300 399.5L529 477.5L736.5 431L533.5 377.5L300 399.5ZM300 399.5L147 414.5"
                stroke="#C44828"
                strokeWidth="5"
            />

            {/* Ghost pen mark gesture */}
            <path
                d="M500.603 394.5L373 263L510 385.996C510 385.996 513.397 385.037 518.5 387C525 389.5 540.5 426 540.5 426C540.5 426 507 407 502.5 403.5C499.023 400.795 500.603 394.5 500.603 394.5Z"
                fill="white"
            />

            {/* Left eye */}
            <motion.ellipse
                key={`l-${blinkKey}`}
                cx="496.652"
                cy="181.087"
                rx="9.59484"
                ry="16.5"
                transform="rotate(30.5666 496.652 181.087)"
                fill="#C44828"
                animate={shouldAnimate ? { scaleY: [1, 0.1, 1] } : undefined}
                transition={{ duration: 0.2, times: [0, 0.5, 1] }}
                style={{ transformOrigin: "496.652px 181.087px" }}
            />

            {/* Right eye */}
            <motion.ellipse
                key={`r-${blinkKey}`}
                cx="533.652"
                cy="200.087"
                rx="9.59484"
                ry="16.5"
                transform="rotate(30.5666 533.652 200.087)"
                fill="#C44828"
                animate={shouldAnimate ? { scaleY: [1, 0.1, 1] } : undefined}
                transition={{ duration: 0.2, times: [0, 0.5, 1] }}
                style={{ transformOrigin: "533.652px 200.087px" }}
            />

            <defs>
                <filter
                    id="ghost-logo-glow"
                    x="0"
                    y="0"
                    width="853"
                    height="725"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
                </filter>
            </defs>
        </motion.svg>
    );
}
