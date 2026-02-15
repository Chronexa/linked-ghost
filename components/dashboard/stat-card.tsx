/**
 * Stat Card Component
 * Reusable metric display for dashboard statistics
 */

'use client';

import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui';

interface StatCardProps {
    label: string;
    value: number | string;
    variant?: 'default' | 'success' | 'brand' | 'neutral';
    icon?: ReactNode;
    loading?: boolean;
}

const variantColors = {
    default: 'text-foreground',
    success: 'text-emerald-600',
    brand: 'text-primary',
    neutral: 'text-muted-foreground',
};

export function StatCard({ label, value, variant = 'default', icon, loading }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                {loading ? (
                    <>
                        <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            {icon && <div className="text-muted-foreground">{icon}</div>}
                            <div className={`text-2xl font-display font-bold ${variantColors[variant]} tabular-nums`}>
                                {value}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
