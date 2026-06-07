import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';

const mockPush = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams()));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/search',
  useSearchParams: () => mockSearchParams(),
}));

describe('FilterPanel', () => {
  it('renders specialty checkboxes', () => {
    render(<FilterPanel />);
    expect(
      screen.getByRole('checkbox', { name: /filter by general/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /filter by emergency/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /filter by dental/i })
    ).toBeInTheDocument();
  });

  it('renders all 8 specialty checkboxes', () => {
    render(<FilterPanel />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);
  });

  it('renders ownership radio buttons', () => {
    render(<FilterPanel />);
    expect(screen.getByRole('radio', { name: /all hospitals/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /public hospitals/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /private hospitals/i })).toBeInTheDocument();
  });

  it('does not show Clear all button when no filters are active', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
    render(<FilterPanel />);
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
  });

  it('shows Clear all button when a specialty filter is active', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('specialty=general'));
    render(<FilterPanel />);
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('marks the active specialty checkbox as checked', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('specialty=dental'));
    render(<FilterPanel />);
    expect(screen.getByRole('checkbox', { name: /filter by dental/i })).toBeChecked();
  });

  it('marks the "All" ownership radio as checked by default', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams());
    render(<FilterPanel />);
    expect(screen.getByRole('radio', { name: /all hospitals/i })).toBeChecked();
  });
});
