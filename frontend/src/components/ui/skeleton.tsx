import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({
  className,
  rounded = 'md',
  ...props
}: SkeletonProps) {
  const radii = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-gradient-to-r from-border-subtle via-bg-canvas to-border-subtle bg-[length:200%_100%]',
        radii[rounded],
        className
      )}
      {...props}
    />
  );
}

