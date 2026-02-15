/**
 * Protected App Layout
 * Shell: collapsible sidebar (240px / 64px) + header + main content
 */

'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
