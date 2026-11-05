import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'danger' | 'warning' | 'success' | 'info';
  title?: string;
  badge?: string;
  onClose?: () => void;
  action?: React.ReactNode;
}

export function Alert({
  className,
  variant = 'info',
  title,
  badge,
  onClose,
  action,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    danger: {
      container: 'bg-danger-bg border border-danger/20 text-text-strong',
      iconBox: 'bg-white text-danger',
      icon: AlertCircle,
      title: 'text-danger',
      badge: 'bg-white text-danger border border-danger/20',
    },
    warning: {
      container: 'bg-warning-bg border border-warning/20 text-text-strong',
      iconBox: 'bg-white text-warning',
      icon: AlertTriangle,
      title: 'text-warning',
      badge: 'bg-white text-warning border border-warning/20',
    },
    success: {
      container: 'bg-success-bg border border-success/20 text-text-strong',
      iconBox: 'bg-white text-success',
      icon: CheckCircle,
      title: 'text-success',
      badge: 'bg-white text-success border border-success/20',
    },
    info: {
      container: 'bg-teal-50 border border-teal-700/20 text-text-strong',
      iconBox: 'bg-white text-teal-700',
      icon: Info,
      title: 'text-teal-700',
      badge: 'bg-white text-teal-700 border border-teal-700/20',
    },
  };

  const current = variantStyles[variant];
  const IconComponent = current.icon;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl p-4 sm:p-5 shadow-sm transition-all',
        current.container,
        className
      )}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={cn(
              'p-2 rounded-lg shrink-0 shadow-sm flex items-center justify-center',
              current.iconBox
            )}
            aria-hidden="true"
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            {(title || badge) && (
              <div className="flex flex-wrap items-center gap-2">
                {title && (
                  <h4 className={cn('font-headline text-sm font-semibold tracking-tight', current.title)}>
                    {title}
                  </h4>
                )}
                {badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase',
                      current.badge
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
            )}
            {children && (
              <div className="text-sm text-text-strong/90 leading-relaxed">
                {children}
              </div>
            )}
          </div>
        </div>
        {(action || onClose) && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {action}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss alert"
                className="p-1 rounded-md text-text-muted hover:text-text-strong hover:bg-black/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

