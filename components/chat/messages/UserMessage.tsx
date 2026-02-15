import { format } from 'date-fns';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserMessageProps {
    content: string;
    createdAt?: Date | string;
}

export function UserMessage({ content, createdAt }: UserMessageProps) {
    return (
        <div className="flex w-full justify-end mb-6">
            <div className="flex max-w-[80%] items-start gap-3">
                <div className="flex flex-col items-end">
                    <div className="rounded-2xl rounded-tr-sm bg-muted/80 text-foreground px-5 py-3.5 shadow-sm border border-border/40">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
                    </div>
                </div>
                {/* Removed User Avatar for cleaner look, similar to Claude/ChatGPT user messages often being simpler */}
            </div>
        </div>
    );
}
