'use client';

import { useState } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { cn } from '@/lib/utils';

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-6">
        <Breadcrumb />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Global search - Cmd+K hint */}
        <div className="relative hidden sm:block">
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Search…"
            className={cn(
              'h-9 w-64 rounded-lg border bg-background px-3 pl-9 text-sm text-charcoal placeholder:text-charcoal-light/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand/20',
              searchFocused ? 'border-brand/50' : 'border-border'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-charcoal-light sm:inline-block">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-light hover:bg-background hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}

