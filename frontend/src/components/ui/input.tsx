import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightAction,
      id,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
          >
            {label}
            {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-text-strong placeholder:text-text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-bg-canvas disabled:text-text-muted',
              leftIcon ? 'pl-9' : 'pl-3',
              rightAction ? 'pr-11' : 'pr-3',
              error
                ? 'border-danger text-danger focus:border-danger focus:ring-danger/20'
                : 'border-border-subtle hover:border-slate-300 focus:border-teal-700 focus:ring-teal-700/20',
              className
            )}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-2 flex items-center">{rightAction}</div>
          )}
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1 text-xs text-danger font-medium mt-1"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-text-muted mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

