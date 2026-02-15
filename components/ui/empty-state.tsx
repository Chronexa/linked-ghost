import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <Card className={cn("border-2 border-dashed bg-muted/10", className)}>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>

                {actionHref ? (
                    <Link href={actionHref}>
                        <Button>{actionLabel}</Button>
                    </Link>
                ) : actionLabel && onAction ? (
                    <Button onClick={onAction}>{actionLabel}</Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
