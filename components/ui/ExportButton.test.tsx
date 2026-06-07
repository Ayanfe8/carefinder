import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButton } from './ExportButton';

vi.mock('@/lib/csv', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/csv')>();
  return { ...actual, exportHospitalsCSV: vi.fn() };
});

const HOSPITALS = [
  {
    name: 'Test Hospital',
    address: '1 Test Street, Lagos',
    phone: '+2348001234567',
    email: null,
    specialties: ['general'],
    rating_avg: 4.0,
  },
];

describe('ExportButton', () => {
  it('renders with "Export CSV" label', () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('modal is not visible before button click', () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens column selection modal on click', async () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(
      screen.getByRole('dialog', { name: /select columns to export/i })
    ).toBeInTheDocument();
  });

  it('modal lists all export columns as checkboxes', async () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelectorAll('input[type="checkbox"]')).toHaveLength(6);
  });

  it('closes modal when Cancel is clicked', async () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Download button is disabled when no columns are selected', async () => {
    render(<ExportButton hospitals={HOSPITALS} />);
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }));
    const dialog = screen.getByRole('dialog');
    // Uncheck all default-selected columns
    for (const cb of Array.from(dialog.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))) {
      if (cb.checked) await userEvent.click(cb);
    }
    expect(screen.getByRole('button', { name: /download/i })).toBeDisabled();
  });
});
