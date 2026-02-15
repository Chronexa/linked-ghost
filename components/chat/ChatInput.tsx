import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Settings, Paperclip, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Ask anything or start drafting..." }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            <div
                className={cn(
                    "relative flex flex-col bg-card border border-border/60 shadow-lg rounded-2xl transition-all duration-200 overflow-hidden",
                    "focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand/50",
                    isLoading && "opacity-80 pointer-events-none"
                )}
            >
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent py-4 px-4 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 leading-relaxed scrollbar-hide"
                    rows={1}
                />

                <div className="flex items-center justify-between px-3 pb-3 pt-2">
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Attach file</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60" align="start">
                                <div className="grid gap-2">
                                    <h4 className="font-medium leading-none mb-1 text-sm">Context</h4>
                                    <p className="text-xs text-muted-foreground mb-2">Adjust what the AI knows about you.</p>
                                    <Button variant="secondary" size="sm" className="w-full justify-start text-xs border-0 bg-muted/50 hover:bg-muted">
                                        Edit Content Pillars
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-lg transition-all duration-200",
                            input.trim()
                                ? "bg-brand text-white shadow-sm hover:bg-brand/90"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        <ArrowUp className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="text-center mt-3">
                <p className="text-[11px] text-muted-foreground/50">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}
