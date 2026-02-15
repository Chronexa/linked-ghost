'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-charcoal mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-surface px-4 text-charcoal',
            'placeholder:text-charcoal-light/40',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            'transition-all duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error focus:ring-error/20 focus:border-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-error mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-charcoal-light mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
