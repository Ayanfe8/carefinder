import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HospitalCard } from './HospitalCard';
import type { Hospital } from '@/lib/types';

const BASE_HOSPITAL: Hospital = {
  id: 'abc-123',
  name: 'Lagos General Hospital',
  address: '1 Marina, Lagos Island',
  city: 'Lagos',
  lga: 'Lagos Island',
  phone: '+2348001234567',
  email: 'info@lagosgeneral.gov.ng',
  specialties: ['general', 'emergency'],
  ownership: 'public',
  description_md: null,
  visiting_hours: null,
  rating_avg: 4.2,
  review_count: 17,
  status: 'published',
  created_by: null,
  created_at: '2026-05-01T00:00:00Z',
};

describe('HospitalCard', () => {
  it('renders hospital name', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    expect(screen.getByText('Lagos General Hospital')).toBeInTheDocument();
  });

  it('renders address and city together', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    // Address and city are joined in a single <p>: "1 Marina, Lagos Island, Lagos"
    expect(screen.getByText('1 Marina, Lagos Island, Lagos')).toBeInTheDocument();
  });

  it('renders aggregate star rating', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    expect(screen.getByLabelText(/4\.2 out of 5/i)).toBeInTheDocument();
  });

  it('renders specialty tags', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('emergency')).toBeInTheDocument();
  });

  it('does NOT show distance when distance prop is omitted', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    expect(screen.queryByText(/\d+ km/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ m$/)).not.toBeInTheDocument();
  });

  it('shows distance in km when distance prop is provided', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} distance={5.3} />);
    expect(screen.getByText('5.3 km')).toBeInTheDocument();
  });

  it('shows distance in metres when distance is under 1 km', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} distance={0.45} />);
    expect(screen.getByText('450 m')).toBeInTheDocument();
  });

  it('links to the hospital detail page', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    const link = screen.getByRole('link', { name: /Lagos General Hospital/i });
    expect(link).toHaveAttribute('href', '/hospitals/abc-123');
  });

  it('shows Export and Share buttons when showActions is true', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} showActions />);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('does NOT show action buttons by default', () => {
    render(<HospitalCard hospital={BASE_HOSPITAL} />);
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
  });
});
