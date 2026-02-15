'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  topics: 'Topics',
  'topics/new': 'Add Topic',
  drafts: 'Generated',
  pillars: 'Pillars',
  voice: 'Voice Training',
  analytics: 'History',
  settings: 'Settings',
};

function segmentLabel(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (segment.match(/^[0-9a-f-]{36}$/i)) return 'Detail';
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const crumbs = segments.map((segment, i) => ({
    href: '/' + segments.slice(0, i + 1).join('/'),
    label: segmentLabel(segment),
    isLast: i === segments.length - 1,
  }));

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {crumbs.map((crumb, i) => (
        <Fragment key={crumb.href}>
          {i > 0 && (
            <span className="text-charcoal-light/60" aria-hidden="true">
              /
            </span>
          )}
          {crumb.isLast ? (
            <span className="font-medium text-charcoal" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-charcoal-light hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1 rounded"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
