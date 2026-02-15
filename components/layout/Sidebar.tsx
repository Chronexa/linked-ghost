'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { Plus, Layers, FileText, Settings, BarChart, Calendar, User } from 'lucide-react';
import { ConversationList } from '@/components/chat/ConversationList';
import { PersonalizationSection } from '@/components/chat/PersonalizationSection';
import { useSearchParams } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/topics', label: 'Topics', icon: Layers },
  { href: '/drafts', label: 'Generated', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

import { LearningCenter } from '@/components/help/learning-center';
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { SetupProgress } from '@/components/onboarding/setup-progress';

export function SidebarContent({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get('conversation');
  const { collapsed } = useSidebar();
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const handleNewPost = () => {
    router.push('/dashboard');
    onLinkClick?.();
  };

  return (
    <>
      <div className={cn("flex h-full flex-col bg-background border-r border-border/60", className)}>
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-border/40 px-5 bg-background">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group" onClick={onLinkClick}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors" aria-hidden="true">
              <span className="text-xs font-bold font-display">CP</span>
            </div>
            {(!collapsed || onLinkClick) && (
              <span className="truncate text-[15px] font-semibold tracking-tight font-display text-foreground">
                ContentPilot
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Post Button */}
          <div className="px-3 py-4">
            <Button
              className={cn(
                "w-full justify-start gap-2.5 shadow-sm h-9 transition-all font-medium",
                collapsed && !onLinkClick ? "px-0 justify-center aspect-square" : "px-3"
              )}
              onClick={handleNewPost}
              variant="primary"
            >
              <Plus className="w-4 h-4" />
              {(!collapsed || onLinkClick) && <span>New Post</span>}
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hover:overflow-y-auto px-2 custom-scrollbar">
            {/* Main Navigation */}
            <nav className="space-y-0.5 mb-6" aria-label="Primary">
              {(!collapsed || onLinkClick) && (
                <h4 className="px-3 text-[11px] font-semibold text-muted-foreground/50 mb-2 uppercase tracking-wider font-display mt-2">
                  Application
                </h4>
              )}

              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-secondary text-secondary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                    title={(collapsed && !onLinkClick) ? label : undefined}
                  >
                    <Icon className={cn("shrink-0 h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                    {(!collapsed || onLinkClick) && <span>{label}</span>}
                  </Link>
                );
              })}

              {/* Scheduler Placeholder */}
              <div className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/40 cursor-not-allowed',
              )}>
                <Calendar className="h-4 w-4 shrink-0" />
                {(!collapsed || onLinkClick) && <span className="flex-1 flex items-center justify-between">
                  Scheduler
                  <span className="text-[9px] uppercase bg-muted px-1.5 py-0.5 rounded font-bold tracking-wide">Soon</span>
                </span>}
              </div>

              {/* Help & Guides - Distinct from nav items */}
              <button
                onClick={() => setShowHelp(true)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted/60 hover:text-foreground mt-2',
                )}
                title={(collapsed && !onLinkClick) ? "Help & Guides" : undefined}
              >
                <HelpCircle className="shrink-0 h-4 w-4 text-brand" />
                {(!collapsed || onLinkClick) && <span>Help & Guides</span>}
              </button>
            </nav>

            {(!collapsed || onLinkClick) && (
              <>
                {/* Setup Progress Widget */}
                <div className="mb-6 px-2">
                  <SetupProgress />
                </div>

                {/* Conversation History */}
                <div className="mb-6">
                  <ConversationList activeId={activeConversationId} onSelect={onLinkClick} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer: User */}
        <div className="border-t border-border/40 p-3 bg-background/50">
          <div className={cn("flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer", (collapsed && !onLinkClick) ? "justify-center" : "")}>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
            {(!collapsed || onLinkClick) && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium leading-none text-foreground">My Account</span>
                <span className="truncate text-[11px] text-muted-foreground mt-0.5">Pro Plan</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <LearningCenter open={showHelp} onOpenChange={setShowHelp} />
    </>
  );
}

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-border bg-background transition-[width] duration-200 ease-out will-change-[width]',
        collapsed ? 'w-[70px]' : 'w-[280px]'
      )}
      aria-label="Main navigation"
    >
      <SidebarContent />

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className="absolute -right-3 top-16 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={cn('h-3 w-3 transition-transform duration-200', collapsed && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
