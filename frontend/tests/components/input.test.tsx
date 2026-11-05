import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders with label and associates with input id', () => {
    render(<Input label="Full Name" id="name-input" />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('renders error message and marks aria-invalid', () => {
    render(<Input label="Email" error="Invalid email address" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email address/i);
  });

  it('renders helper text when no error exists', () => {
    render(<Input label="Phone" helperText="Include country code, e.g. +94" />);
    expect(screen.getByText(/include country code/i)).toBeInTheDocument();
  });
});

