'use client';

import { Dispatch, SetStateAction } from 'react';
import { BillingInterval } from '@/lib/config/plans.config';

interface BillingToggleProps {
    billing: BillingInterval;
    setBilling: Dispatch<SetStateAction<BillingInterval>>;
}

export function BillingToggle({ billing, setBilling }: BillingToggleProps) {
    return (
        <div className="inline-flex items-center gap-1 bg-[#F5F0E8] rounded-full p-1 border border-[#E8E2D8]">
            <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billing === 'monthly'
                        ? 'bg-white text-[#1A1A1D] shadow-sm'
                        : 'text-[#52525B] hover:text-[#1A1A1D]'
                    }`}>
                Monthly
            </button>

            <button
                onClick={() => setBilling('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${billing === 'yearly'
                        ? 'bg-white text-[#1A1A1D] shadow-sm'
                        : 'text-[#52525B] hover:text-[#1A1A1D]'
                    }`}>
                Yearly
                <span className="text-[10px] font-bold uppercase tracking-wide bg-[#C1502E] text-white px-2 py-0.5 rounded-full">
                    Save 20%
                </span>
            </button>
        </div>
    );
}
