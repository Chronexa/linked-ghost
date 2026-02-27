import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Variant {
    id: string; // 'A', 'B', 'C'
    style: string;
    content: string;
    hook: string;
    metadata?: any;
}

interface VariantCardProps {
    variant: Variant;
    onSelect: (variant: Variant) => void;
    isSaving?: boolean;
}

export function VariantCard({ variant, onSelect, isSaving }: VariantCardProps) {
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(variant.content);
        toast.success('Copied to clipboard');
    };

    return (
        <Card className="flex flex-col h-full hover:border-primary/50 transition-colors group">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                        {variant.style}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleCopy}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[300px] text-sm text-muted-foreground whitespace-pre-wrap">
                <p className="font-medium text-foreground mb-2">{variant.hook}</p>
                {variant.content.replace(variant.hook, '').trim()}
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
                <Button
                    className="w-full"
                    onClick={() => onSelect(variant)}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Select & Save'}
                </Button>
            </CardFooter>
        </Card>
    );
}
