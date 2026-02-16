import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PenTool, Lightbulb, Zap } from 'lucide-react';
import { ChatInput } from './ChatInput';

interface EmptyStateDashboardProps {
    onResearchIdeas: () => void;
    onQuickPrompt: (prompt: string) => void;
    onQuickPost: () => void;
}

export function EmptyStateDashboard({ onResearchIdeas, onQuickPrompt, onQuickPost }: EmptyStateDashboardProps) {

    const suggestedPrompts = [
        "Write a post about AI trends in 2026",
        "Share a lesson learned from a recent failure",
        "Create a &apos;How-to&apos; guide for productivity",
        "Discuss the future of remote work"
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full max-w-5xl mx-auto px-6 animate-in fade-in duration-500">
            <div className="text-center mb-12 space-y-4 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
                    ContentPilot AI
                </h1>
                <p className="text-charcoal-light text-xl leading-relaxed">
                    Your AI LinkedIn Ghostwriter. What would you like to create today?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
                <Card
                    className="cursor-pointer hover:border-brand/30 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden"
                    onClick={onResearchIdeas}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Search className="w-24 h-24 text-brand" />
                    </div>
                    <CardHeader className="pb-2">
                        <div className="mb-4 p-3 bg-brand/5 w-fit rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                            <Search className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl">Research Ideas</CardTitle>
                        <CardDescription className="text-base">Find trending topics matching your pillars</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-charcoal-light leading-relaxed">
                            I&apos;ll browse the web for the latest opportunities in your niche and suggest high-performing angles.
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer border-brand/20 bg-brand/5 hover:bg-brand/10 hover:border-brand/40 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden"
                    onClick={onQuickPost}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-24 h-24 text-brand" />
                    </div>
                    <CardHeader className="pb-2">
                        <div className="mb-4 p-3 bg-brand w-fit rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                            <Zap className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl text-brand-dark">Quick Post</CardTitle>
                        <CardDescription className="text-base text-brand-dark/80">Fast-track: Idea to 3 Variants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-brand-dark/70 leading-relaxed font-medium">
                            Skip the chat. Enter an idea and get 3 distinct options (Bold, Pro, Casual) instantly.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full max-w-3xl space-y-6">
                <div className="flex flex-wrap gap-3 justify-center">
                    {suggestedPrompts.map((prompt, idx) => (
                        <Button
                            key={idx}
                            variant="secondary"
                            className="rounded-full text-xs h-9 bg-surface hover:bg-white hover:border-brand/30 hover:text-brand transition-all shadow-sm"
                            onClick={() => onQuickPrompt(prompt)}
                        >
                            <Lightbulb className="w-3.5 h-3.5 mr-2 text-brand" />
                            {prompt}
                        </Button>
                    ))}
                </div>

                <ChatInput onSend={onQuickPrompt} placeholder="Ask anything or start drafting..." />
            </div>
        </div>
    );
}
