'use client';

import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { TrialBanner } from '@/components/layout/trial-banner';
import { TrialExpired } from '@/components/subscription/trial-expired';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-charcoal font-sans">
        <Sidebar />
        <MobileSidebar />
        <MainContent>{children}</MainContent>
        {/* Trial expired full-screen overlay — blocks app when trial ends */}
        <TrialExpired />
      </div>
    </SidebarProvider>
  );
}

function MainContent({ children }: PropsWithChildren) {
  const { collapsed, setMobileOpen } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 transition-[margin] duration-200 ease-out flex flex-col',
        collapsed ? 'md:ml-16' : 'md:ml-64'
      )}
    >
      {/* Persistent trial banner — top of app */}
      <TrialBanner />

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
              <span className="text-xs font-bold text-primary-foreground">CP</span>
            </div>
            <span className="font-semibold tracking-tight">ContentPilot</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-[1600px] p-4 md:p-10 lg:p-12 min-h-[calc(100vh-65px)] md:min-h-screen">
        {children}
      </div>
    </main>
  );
}

