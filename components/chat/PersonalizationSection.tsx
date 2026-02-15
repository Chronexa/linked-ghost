import { useState } from 'react';
import { User, Layers, Mic, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function PersonalizationSection() {
    // Mock data for now - or fetch via hook
    // In real implementation, pass these as props or useQuery
    const stats = {
        profileCompletion: 70,
        pillarsCount: 2,
        voiceTrained: 65
    };

    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="px-2 py-2">
            <div className="flex items-center justify-between px-2 mb-2">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1 w-full justify-between group">
                        <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            Personalization
                        </div>
                        {stats.profileCompletion < 100 && (
                            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" title="Profile incomplete" />
                        )}
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-1">
                {/* Profile */}
                <Link href="/profile" className="flex flex-col gap-1 p-2 rounded-md hover:bg-accent/50 group transition-colors">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stats.profileCompletion}%</span>
                    </div>
                    <Progress value={stats.profileCompletion} className="h-1" />
                </Link>

                {/* Pillars */}
                <Link href="/pillars" className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 group transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground text-sm">
                        <Layers className="w-4 h-4" />
                        <span>Content Pillars</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{stats.pillarsCount}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                </Link>

                {/* Voice */}
                <Link href="/voice-training" className="flex flex-col gap-1 p-2 rounded-md hover:bg-accent/50 group transition-colors">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                            <Mic className="w-4 h-4" />
                            <span>Voice Training</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stats.voiceTrained}%</span>
                    </div>
                    <Progress value={stats.voiceTrained} className="h-1" color="green" />
                </Link>

            </CollapsibleContent>
        </Collapsible>
    );
}
