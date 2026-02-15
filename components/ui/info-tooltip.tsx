"use client";

import { Info } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
    iconClassName?: string;
}

export function InfoTooltip({ content, side = "top", className, iconClassName }: InfoTooltipProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        className
                    )}
                    type="button"
                    aria-label="More information"
                >
                    <Info className={cn("h-4 w-4", iconClassName)} />
                </button>
            </PopoverTrigger>
            <PopoverContent side={side} className="w-80 text-sm p-4">
                {content}
            </PopoverContent>
        </Popover>
    );
}
