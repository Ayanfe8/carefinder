import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingWidget } from './RatingWidget';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({ insert: vi.fn() }),
  }),
}));

const defaultProps = { hospitalId: 'h-001', ratingAvg: 4.2, reviewCount: 10 };

describe('RatingWidget', () => {
  it('renders 5 stars in loading state before auth resolves', () => {
    render(<RatingWidget {...defaultProps} />);
    // Before getUser() resolves: stars are aria-hidden spans, not buttons
    expect(screen.getAllByText('★')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: /rate/i })).toBeNull();
  });

  it('renders the section heading', () => {
    render(<RatingWidget {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: /rate this hospital/i })
    ).toBeInTheDocument();
  });

  it('shows current rating info when ratingAvg > 0', () => {
    render(<RatingWidget {...defaultProps} />);
    expect(screen.getByText(/4\.2/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('shows "No ratings yet" message when ratingAvg is 0', () => {
    render(<RatingWidget hospitalId="h-002" ratingAvg={0} reviewCount={0} />);
    expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
  });

  it('transitions to interactive stars after auth resolves', async () => {
    render(<RatingWidget {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /rate \d star/i })).toHaveLength(5)
    );
  });

  it('shows sign-in prompt after clicking a star when unauthenticated', async () => {
    render(<RatingWidget {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /rate 1 star/i })).toHaveLength(1)
    );

    await userEvent.click(screen.getByRole('button', { name: /rate 1 star/i }));

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
  });
});
