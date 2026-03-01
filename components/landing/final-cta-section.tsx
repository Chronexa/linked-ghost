import Link from 'next/link';
import { Button } from '@/components/ui';
import { Lock, XCircle, Zap } from 'lucide-react';

/**
 * Ghost glow mark — inline SVG of the brand logo rendered large on the dark bg.
 * The blue halo pops beautifully against #0F0F12.
 */
function GhostGlowMark() {
    return (
        <svg
            width="64"
            height="54"
            viewBox="0 0 853 725"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="mx-auto mb-6 opacity-90"
        >
            {/* Blue glow halo — stands out on dark bg */}
            <g filter="url(#cta-glow)">
                <ellipse cx="426.5" cy="362.5" rx="226.5" ry="162.5" fill="#AFD5EF" fillOpacity="0.9" />
            </g>

            {/* Ghost body */}
            <path
                d="M713 357.5C713 357.5 587 370.465 570.5 365.5C554 360.535 532.47 342.232 528.5 306.5C523 257 590 188 574.5 139.5C564.273 107.5 531.175 84.0602 489.5 86.0001C433 93.5 406 161 357 191C277.337 239.773 214 306.5 246.5 405.5L713 357.5Z"
                fill="white"
                stroke="#C44828"
                strokeWidth="5"
            />

            {/* Paper arm */}
            <path d="M736.5 431L533.5 377.5L300 399.5L529 477.5L736.5 431Z" fill="white" />
            <path
                d="M300 399.5L529 477.5L736.5 431L533.5 377.5L300 399.5ZM300 399.5L147 414.5"
                stroke="#C44828"
                strokeWidth="5"
            />

            {/* Eyes */}
            <ellipse cx="496.652" cy="181.087" rx="9.59484" ry="16.5" transform="rotate(30.5666 496.652 181.087)" fill="#C44828" />
            <ellipse cx="533.652" cy="200.087" rx="9.59484" ry="16.5" transform="rotate(30.5666 533.652 200.087)" fill="#C44828" />

            <defs>
                <filter id="cta-glow" x="0" y="0" width="853" height="725" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur" />
                </filter>
            </defs>
        </svg>
    );
}

export function FinalCtaSection() {
    return (
        <section className="w-full bg-[#0F0F12] py-32 border-t border-gray-800" aria-label="Final Call to Action">
            <div className="container mx-auto px-6 max-w-[1100px] text-center">

                {/* Ghost brand mark — the ghostwriter makes its final appearance here */}
                <GhostGlowMark />

                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Your next LinkedIn post is 3 minutes away.
                </h2>
                <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                    Join 50+ professionals who've replaced the blank page with LinkedIn Ghostwriter AI.
                </p>
                <div className="flex justify-center mb-10">
                    <Link href="/sign-up">
                        <Button size="lg" className="bg-brand text-white hover:bg-brand/90 px-10 py-7 text-lg rounded-xl shadow-[0_0_30px_rgba(193,80,46,0.2)] hover:shadow-[0_0_40px_rgba(193,80,46,0.3)] transition-all hover:scale-105">
                            Start your 7-day free trial &rarr;
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden="true" /> No credit card required</span>
                    <span className="flex items-center gap-2"><XCircle className="w-4 h-4" aria-hidden="true" /> Cancel any time, instantly</span>
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" aria-hidden="true" /> Set up in under 5 minutes</span>
                </div>
            </div>
        </section>
    );
}
