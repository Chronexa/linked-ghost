'use client';

import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarContent } from './Sidebar';

export function MobileSidebar() {
    const { mobileOpen, setMobileOpen } = useSidebar();
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, setMobileOpen]);

    if (!mobileOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar Container */}
            <div className="fixed inset-y-0 left-0 w-72 bg-background shadow-2xl border-r border-border transform transition-transform duration-300 ease-in-out animate-in slide-in-from-left">
                <div className="absolute right-4 top-4 z-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileOpen(false)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="h-full">
                    <SidebarContent
                        className="bg-background"
                        onLinkClick={() => setMobileOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}
