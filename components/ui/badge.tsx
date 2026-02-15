'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'neutral' | 'destructive' | 'secondary' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      brand: 'bg-primary/10 text-primary border-primary/20 border',
      success: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50 border',
      warning: 'bg-amber-500/10 text-amber-700 border-amber-200/50 border',
      neutral: 'bg-muted text-muted-foreground border-border border',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
      destructive: 'bg-destructive/10 text-destructive border-destructive/20 border',
      outline: 'text-foreground border-border border',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
