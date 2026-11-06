import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthSplitCard } from '@/features/auth/components/auth-split-card';

describe('AuthSplitCard Component (Redesigned Split Auth Experience)', () => {
  it('renders login state by default with login form and secure operations visual panel', () => {
    render(<AuthSplitCard />);

    // Headings
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /secure clinical operations/i })).toBeInTheDocument();

    // Fields
    expect(screen.getByLabelText(/clinic staff email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/security password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to workspace/i })).toBeInTheDocument();

    // Toggle button to request access
    expect(screen.getAllByRole('button', { name: /request access/i }).length).toBeGreaterThan(0);
  });

  it('switches to sign up state when toggle button is clicked', () => {
    render(<AuthSplitCard />);

    const requestAccessBtns = screen.getAllByRole('button', { name: /request access/i });
    fireEvent.click(requestAccessBtns[0]);

    // Sign up headings & visual panel
    expect(screen.getByRole('heading', { name: /request staff access/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /join the clinical network/i })).toBeInTheDocument();

    // Fields in signup
    expect(screen.getByLabelText(/full legal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designated role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit access request/i })).toBeInTheDocument();
  });

  it('shows password mismatch error in sign up form when passwords do not match', async () => {
    render(<AuthSplitCard initialMode="signup" />);

    fireEvent.change(screen.getByLabelText(/full legal name/i), {
      target: { value: 'Dr. Saman Perera' },
    });
    fireEvent.change(screen.getByLabelText(/clinic staff email/i), {
      target: { value: 'saman@ayucare.lk' },
    });
    fireEvent.change(screen.getByLabelText(/^password \*/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm \*/i), {
      target: { value: 'differentPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit access request/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords you entered do not match/i)).toBeInTheDocument();
    });
  });

  it('displays truthful administrator review notice upon valid request submission', async () => {
    render(<AuthSplitCard initialMode="signup" />);

    fireEvent.change(screen.getByLabelText(/full legal name/i), {
      target: { value: 'Dr. Nimal Wickrama' },
    });
    fireEvent.change(screen.getByLabelText(/clinic staff email/i), {
      target: { value: 'nimal.w@ayucare.lk' },
    });
    fireEvent.change(screen.getByLabelText(/^password \*/i), {
      target: { value: 'SafePassword123' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm \*/i), {
      target: { value: 'SafePassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit access request/i }));

    await waitFor(() => {
      expect(screen.getByText(/access request received/i)).toBeInTheDocument();
      expect(screen.getByText(/colombo central op clinic administrator/i)).toBeInTheDocument();
    });
  });

  it('allows switching back to login from sign up', () => {
    render(<AuthSplitCard initialMode="signup" />);

    const signInBtns = screen.getAllByRole('button', { name: /sign in/i });
    fireEvent.click(signInBtns[0]);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
