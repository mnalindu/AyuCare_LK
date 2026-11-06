'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightAction'> {
  showToggle?: boolean;
}

/**
 * Accessible password input component with show/hide toggle.
 * Follows AyuCare LK Clinical Clarity design guidelines.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const toggleButton = showToggle ? (
      <button
        type="button"
        onClick={toggleVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-strong hover:bg-bg-canvas transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/20"
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-text-muted" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4 text-text-muted" aria-hidden="true" />
        )}
      </button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        leftIcon={leftIcon || <Lock className="h-4 w-4" aria-hidden="true" />}
        rightAction={toggleButton}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

