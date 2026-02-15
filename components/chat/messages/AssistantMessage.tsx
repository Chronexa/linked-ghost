import { format } from 'date-fns';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AssistantMessageProps {
    content: string;
    createdAt?: Date | string;
    isStreaming?: boolean;
}

export function AssistantMessage({ content, createdAt, isStreaming }: AssistantMessageProps) {
    return (
        <div className="flex w-full justify-start mb-6">
            <div className="flex max-w-[90%] items-start gap-4">
                <Avatar className="h-8 w-8 mt-1 border border-border/50 shrink-0">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-brand/10 text-brand">
                        <Bot className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0">
                    <div className={cn(
                        "rounded-2xl rounded-tl-sm px-0 py-1 text-foreground",
                        "prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50"
                    )}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                    {createdAt && (
                        <span className="mt-2 text-[10px] text-muted-foreground/60 font-medium tracking-wide uppercase">
                            AI • {format(new Date(createdAt), 'p')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
