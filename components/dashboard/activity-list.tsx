/**
 * Activity List Component
 * Wrapper for recent drafts list with pagination
 */

'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { DraftItem } from './draft-item';

interface Draft {
    id: string;
    fullText: string;
    status: string;
    variantLetter: string;
    characterCount: number;
}

interface ActivityListProps {
    drafts: Draft[];
    maxItems?: number;
    emptyState?: ReactNode;
    onEdit: (id: string) => void;
    onApprove: (id: string) => void;
    approvingId?: string | null;
}

export function ActivityList({
    drafts,
    maxItems = 5,
    emptyState,
    onEdit,
    onApprove,
    approvingId
}: ActivityListProps) {
    const displayedDrafts = drafts.slice(0, maxItems);
    const hasMore = drafts.length > maxItems;

    if (drafts.length === 0 && emptyState) {
        return <>{emptyState}</>;
    }

    return (
        <>
            <ul className="space-y-3">
                {displayedDrafts.map((draft) => (
                    <li key={draft.id}>
                        <DraftItem
                            draft={draft}
                            onEdit={onEdit}
                            onApprove={onApprove}
                            isApproving={approvingId === draft.id}
                        />
                    </li>
                ))}
            </ul>

            {hasMore && (
                <div className="mt-4">
                    <Link href="/drafts">
                        <Button variant="ghost" size="sm">
                            View all generated →
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
}
