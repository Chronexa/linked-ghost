import { useConversations } from '@/lib/hooks/use-conversations';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { MessageSquare, MoreHorizontal, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationListProps {
    activeId?: string | null;
    onSelect?: () => void;
}

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
    const { conversations, loading } = useConversations();

    if (loading) {
        return (
            <div className="space-y-1 px-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="px-4 py-8 text-sm text-muted-foreground/60 text-center italic">
                No history yet
            </div>
        );
    }

    // Group conversations
    const grouped = {
        today: [] as any[],
        yesterday: [] as any[],
        previous: [] as any[],
    };

    conversations.forEach((conv) => {
        const date = new Date(conv.updatedAt);
        if (isToday(date)) {
            grouped.today.push(conv);
        } else if (isYesterday(date)) {
            grouped.yesterday.push(conv);
        } else {
            grouped.previous.push(conv);
        }
    });

    const renderGroup = (title: string, items: any[]) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-6">
                <h4 className="px-3 text-[11px] font-semibold text-muted-foreground/50 mb-2 uppercase tracking-wider font-display">
                    {title}
                </h4>
                <div className="space-y-0.5">
                    {items.map((conv) => {
                        const isActive = activeId === conv.id;
                        return (
                            <div key={conv.id} className="relative group px-1">
                                <Link
                                    href={`/dashboard?conversation=${conv.id}`}
                                    onClick={onSelect}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 group-hover:pr-8",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium shadow-sm"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <MessageSquare className={cn(
                                        "w-4 h-4 shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground/70"
                                    )} />
                                    <span className="truncate flex-1 leading-none">
                                        {conv.title || conv.lastMessagePreview || "New Chat"}
                                    </span>
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "absolute right-2 top-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all",
                                                isActive ? "opacity-0 hover:bg-background/20" : "hover:bg-background"
                                            )}
                                        >
                                            <MoreHorizontal className="w-3 h-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                            <Trash2 className="w-3 h-3 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="py-2">
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('Previous', grouped.previous)}
        </div>
    );
}
