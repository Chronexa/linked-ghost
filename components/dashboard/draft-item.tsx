/**
 * Draft Item Component
 * Individual draft card for activity list
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@/components/ui';

interface Draft {
    id: string;
    fullText: string;
    status: string;
    variantLetter: string;
    characterCount: number;
}

interface DraftItemProps {
    draft: Draft;
    onEdit: (id: string) => void;
    onApprove: (id: string) => void;
    isApproving?: boolean;
}

const DRAFT_STATUS_LABEL: Record<string, string> = {
    draft: 'Draft',
    approved: 'Approved',
    scheduled: 'Scheduled',
    posted: 'Posted',
    rejected: 'Rejected',
};

export function DraftItem({ draft, onEdit, onApprove, isApproving }: DraftItemProps) {
    return (
        <Card hover className="transition-all duration-200">
            <CardContent className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                            {draft.fullText}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="font-normal">
                                {DRAFT_STATUS_LABEL[draft.status] ?? draft.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Variant {draft.variantLetter} · {draft.characterCount} chars
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/drafts/${draft.id}`}>
                            <Button variant="secondary" size="sm">
                                Edit
                            </Button>
                        </Link>
                        {draft.status === 'draft' && (
                            <Button
                                size="sm"
                                onClick={() => onApprove(draft.id)}
                                disabled={isApproving}
                            >
                                {isApproving ? 'Approving…' : 'Approve'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
