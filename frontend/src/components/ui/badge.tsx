import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'teal';
  pill?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  pill = true,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    success: 'bg-success-bg text-success border-success/20',
    warning: 'bg-warning-bg text-warning border-warning/20',
    danger: 'bg-danger-bg text-danger border-danger/20',
    neutral: 'bg-bg-canvas text-text-muted border-border-subtle',
    teal: 'bg-teal-50 text-teal-700 border-teal-700/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border tracking-wide uppercase',
        pill ? 'rounded-full' : 'rounded-md',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

