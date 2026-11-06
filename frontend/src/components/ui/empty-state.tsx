import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border-subtle bg-white/60',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-bg-canvas flex items-center justify-center text-text-muted mb-4 shadow-sm">
        <Icon className="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
      </div>
      <h3 className="font-headline text-base font-semibold text-text-strong mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm mb-5">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

