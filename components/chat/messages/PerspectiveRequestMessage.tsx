import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Sparkles, SkipForward } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PerspectiveRequestMessageProps {
    onSubmit: (perspective: string) => void;
    onSkip: () => void;
    isLoading?: boolean;
}

export function PerspectiveRequestMessage({ onSubmit, onSkip, isLoading }: PerspectiveRequestMessageProps) {
    const [perspective, setPerspective] = useState('');
    const minChars = 20;

    const handleSubmit = () => {
        if (perspective.length >= minChars) {
            onSubmit(perspective);
        }
    };

    return (
        <div className="flex w-full justify-start mb-6">
            <div className="flex w-full max-w-[90%] items-start gap-3">
                <Avatar className="h-8 w-8 mt-1 border border-border">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Bot className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col w-full gap-3">
                    <div className="bg-secondary/40 border border-border/50 rounded-2xl rounded-tl-sm px-5 py-4 text-sm shadow-sm">
                        That&apos;s a great topic. What&apos;s your unique perspective or take on this? Or you can skip to let me suggest an angle.
                    </div>

                    <div className="border border-border/60 rounded-2xl p-5 bg-surface shadow-sm w-full max-w-2xl transition-all hover:shadow-md focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50">
                        <Textarea
                            value={perspective}
                            onChange={(e) => setPerspective(e.target.value)}
                            placeholder="E.g., I believe this trend is overhyped because..."
                            className="resize-none min-h-[100px] text-sm mb-2 border-0 focus-visible:ring-0 px-0 -mt-1"
                        />

                        <div className="flex items-center justify-between pt-2 border-t">
                            <span className={cn("text-xs", perspective.length < minChars ? "text-muted-foreground" : "text-green-600")}>
                                {perspective.length} chars {perspective.length < minChars && `(min ${minChars})`}
                            </span>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSkip}
                                    disabled={isLoading}
                                >
                                    <SkipForward className="w-4 h-4 mr-2" /> Skip
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={perspective.length < minChars || isLoading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isLoading ? "Generating..." : "Generate Post"}
                                    {!isLoading && <Sparkles className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
