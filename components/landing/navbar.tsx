"use client";

import Link from 'next/link';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Guides', href: '/guides' },
        { label: 'Sign In', href: '/dashboard' },
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md" aria-label="Main Navigation">
            <div className="max-w-[1100px] mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2" aria-label="ContentPilot AI Home">
                        <span className="text-xl font-display font-semibold text-gray-900 tracking-tight">
                            ContentPilot AI
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <Link href="/sign-up" aria-label="Start Free Trial">
                            <Button size="sm" className="bg-brand text-white hover:bg-brand/90 font-medium">
                                Start Free Trial &rarr;
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile: hamburger + CTA */}
                    <div className="flex items-center gap-3 md:hidden">
                        <Link href="/sign-up">
                            <Button size="sm" className="bg-brand text-white hover:bg-brand/90 font-medium text-xs">
                                Try Free
                            </Button>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen
                                ? <X className="w-5 h-5 text-gray-700" />
                                : <Menu className="w-5 h-5 text-gray-700" />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center py-3 text-base text-gray-700 font-medium hover:text-gray-900 border-b border-gray-50 last:border-0 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-4">
                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full bg-brand text-white hover:bg-brand/90 h-12 text-base">
                                Start 7-Day Free Trial &rarr;
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
