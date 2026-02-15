import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PenTool, Lightbulb } from 'lucide-react';
import { ChatInput } from './ChatInput';

interface EmptyStateDashboardProps {
    onResearchIdeas: () => void;
    onWriteFromScratch: () => void;
    onQuickPrompt: (prompt: string) => void;
}

export function EmptyStateDashboard({ onResearchIdeas, onWriteFromScratch, onQuickPrompt }: EmptyStateDashboardProps) {

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
                    className="cursor-pointer hover:border-brand/30 hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden"
                    onClick={onWriteFromScratch}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PenTool className="w-24 h-24 text-brand" />
                    </div>
                    <CardHeader className="pb-2">
                        <div className="mb-4 p-3 bg-brand/5 w-fit rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl">Write from Scratch</CardTitle>
                        <CardDescription className="text-base">Share your thoughts, I&apos;ll polish them</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-charcoal-light leading-relaxed">
                            Dump your raw ideas or voice notes, and I&apos;ll structure them into viral LinkedIn posts.
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
