/**
 * Protected App Layout
 * Shared layout for all authenticated pages
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-surface/95">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-display font-bold text-sm">CP</span>
              </div>
              <span className="text-lg font-display font-semibold text-charcoal">
                ContentPilot AI
              </span>
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/topics">Topics</NavLink>
              <NavLink href="/drafts">Drafts</NavLink>
              <NavLink href="/pillars">Pillars</NavLink>
              <NavLink href="/voice">Voice Training</NavLink>
              <NavLink href="/analytics">Analytics</NavLink>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="p-2 hover:bg-background rounded-lg transition"
                aria-label="Settings"
              >
                <svg
                  className="w-5 h-5 text-charcoal-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-12">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        isActive
          ? 'text-brand bg-brand/5'
          : 'text-charcoal-light hover:text-charcoal hover:bg-background'
      )}
    >
      {children}
    </Link>
  );
}
