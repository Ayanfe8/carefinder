import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

// vi.hoisted ensures mockPush is available inside the hoisted vi.mock factory
const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/search',
  // Stable reference — new URLSearchParams() on every render would trigger useEffect
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe('SearchBar', () => {
  it('has role="search" on the form', () => {
    render(<SearchBar />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('has an accessible label on the input', () => {
    render(<SearchBar />);
    // aria-label on the input element
    expect(
      screen.getByRole('searchbox', { name: /search hospitals by name/i })
    ).toBeInTheDocument();
  });

  it('pre-populates with defaultValue', () => {
    render(<SearchBar defaultValue="Abuja" />);
    expect(screen.getByRole('searchbox')).toHaveValue('Abuja');
  });

  it('updates value as user types', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'Kano');
    expect(input).toHaveValue('Kano');
  });

  it('calls router.push when the form is submitted', () => {
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    // fireEvent.change avoids userEvent async internals conflicting with fake timers
    fireEvent.change(input, { target: { value: 'Lagos' } });
    fireEvent.submit(screen.getByRole('search'));
    // handleSubmit clears the debounce and calls navigate exactly once
    expect(mockPush).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('includes the trimmed query in the push URL', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, '  Lagos  ');
    fireEvent.submit(screen.getByRole('search'));
    // Use toHaveBeenCalledWith to avoid depending on call position
    // (debounce timers from sibling tests can fire into calls[0])
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('q=Lagos'));
  });

  it('has a Search submit button', () => {
    render(<SearchBar />);
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });
});
