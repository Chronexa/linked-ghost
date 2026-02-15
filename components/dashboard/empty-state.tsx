/**
 * Dashboard Empty State Component
 * Context-aware guidance for different user scenarios
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { Sparkles, TrendingUp, Target, FileText } from 'lucide-react';
import type { StatsResponse } from '@/lib/hooks/use-stats';

export type EmptyStateScenario = 'fully-empty' | 'no-pending' | 'no-classified' | 'no-drafts';

const scenarios = {
    'fully-empty': {
        icon: Sparkles,
        iconColor: 'text-blue-500',
        headline: 'Your AI ghostwriter is ready',
        description: 'We\'ll scan for topics at 6 AM daily. Tip: Use "Research" to find trending ideas instantly, or add a topic manually.',
        ctaText: 'Add Manual Topic',
        ctaHref: '/topics/new',
        ctaVariant: 'primary' as const,
    },
    'no-pending': {
        icon: TrendingUp,
        iconColor: 'text-green-500',
        headline: 'No new topics today',
        description: 'We\'ll find more at 6 AM tomorrow. Check back then!',
        ctaText: 'View Classified Topics',
        ctaHref: '/topics',
        ctaVariant: 'secondary' as const,
    },
    'no-classified': {
        icon: Target,
        iconColor: 'text-orange-500',
        headline: (stats?: StatsResponse) =>
            `You have ${stats?.pendingTopics || 0} topic${stats?.pendingTopics === 1 ? '' : 's'} waiting`,
        description: 'Classifying topics matches them to your Content Pillars, enabling the AI to write tailored posts in your voice.',
        ctaText: 'Classify Now',
        ctaHref: '/topics',
        ctaVariant: 'primary' as const,
    },
    'no-drafts': {
        icon: FileText,
        iconColor: 'text-purple-500',
        headline: 'Ready to generate posts?',
        description: (stats?: StatsResponse) =>
            `You have ${stats?.classifiedTopics || 0} classified topic${stats?.classifiedTopics === 1 ? '' : 's'} ready. Generate your first draft to see the magic!`,
        ctaText: 'Go to Topics',
        ctaHref: '/topics',
        ctaVariant: 'primary' as const,
    },
};

interface Action {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'ghost';
}

interface EmptyStateProps {
    scenario?: EmptyStateScenario;
    stats?: StatsResponse;
    icon?: React.ElementType | React.ReactNode;
    headline?: string;
    description?: string;
    primaryAction?: Action;
    secondaryAction?: Action;
}

export function EmptyState({
    scenario,
    stats,
    icon: CustomIcon,
    headline: customHeadline,
    description: customDescription,
    primaryAction,
    secondaryAction
}: EmptyStateProps) {
    // If scenario provided, use it as base
    const config = scenario ? scenarios[scenario] : null;

    // Resolve values (custom props take precedence)
    const Icon = CustomIcon || config?.icon || Sparkles;

    const headline = customHeadline || (config
        ? (typeof config.headline === 'function' ? config.headline(stats) : config.headline)
        : '');

    const description = customDescription || (config
        ? (typeof config.description === 'function' ? config.description(stats) : config.description)
        : '');

    // Resolve actions
    const mainAction: Action | null = primaryAction || (config ? {
        label: config.ctaText,
        href: config.ctaHref,
        variant: config.ctaVariant
    } : null);

    return (
        <Card className="border-2 border-dashed border-border shadow-none">
            <CardContent className="py-12 text-center flex flex-col items-center">
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-surface-hover p-4 ring-1 ring-border">
                        {React.isValidElement(Icon) ? Icon : (
                            // @ts-ignore - Icon is ElementType here
                            <Icon className={`w-8 h-8 ${config?.iconColor || 'text-brand'}`} />
                        )}
                    </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-charcoal mb-3 max-w-lg mx-auto">
                    {headline}
                </h3>

                <p className="text-base text-charcoal-light mb-8 max-w-md mx-auto leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {mainAction && (
                        mainAction.href ? (
                            <Link href={mainAction.href}>
                                <Button variant={mainAction.variant || 'primary'}>
                                    {mainAction.label}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant={mainAction.variant || 'primary'}
                                onClick={mainAction.onClick}
                            >
                                {mainAction.label}
                            </Button>
                        )
                    )}

                    {secondaryAction && (
                        secondaryAction.href ? (
                            <Link href={secondaryAction.href}>
                                <Button variant={secondaryAction.variant || 'secondary'}>
                                    {secondaryAction.label}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant={secondaryAction.variant || 'secondary'}
                                onClick={secondaryAction.onClick}
                            >
                                {secondaryAction.label}
                            </Button>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Helper function to determine which empty state scenario to show
 */
export function determineEmptyStateScenario(stats: StatsResponse): EmptyStateScenario | null {
    const { pendingTopics, classifiedTopics, generatedPosts } = stats;

    // All zeros = first-time user
    if (pendingTopics === 0 && classifiedTopics === 0 && generatedPosts === 0) {
        return 'fully-empty';
    }

    // Has pending, zero classified = needs classification
    if (pendingTopics > 0 && classifiedTopics === 0) {
        return 'no-classified';
    }

    // Has classified, zero drafts = needs generation
    if (classifiedTopics > 0 && generatedPosts === 0) {
        return 'no-drafts';
    }

    // Zero pending (but has other data) = waiting for next scan
    if (pendingTopics === 0 && (classifiedTopics > 0 || generatedPosts > 0)) {
        return 'no-pending';
    }

    // No empty state needed - user has data
    return null;
}
