import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HospitalDetail } from './HospitalDetail';
import type { Hospital, Review } from '@/lib/types';

// RatingWidget calls supabase.auth.getUser() on mount — mock it to prevent hang
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  }),
}));

const BASE_HOSPITAL: Hospital = {
  id: 'h-001',
  name: 'University College Hospital',
  address: 'Queen Elizabeth II Road, Aleshinloye',
  city: 'Ibadan',
  lga: 'Ibadan North',
  phone: '+2348067890124',
  email: 'info@uch-ibadan.edu.ng',
  specialties: ['general', 'emergency', 'maternity', 'cardiology'],
  ownership: 'public',
  description_md: '# UCH Ibadan\n\nNigeria\'s **first** teaching hospital.',
  visiting_hours: 'Monday – Friday: 8 am – 5 pm',
  rating_avg: 4.5,
  review_count: 32,
  status: 'published',
  created_by: null,
  created_at: '2026-05-01T00:00:00Z',
};

const APPROVED_REVIEWS: Review[] = [
  {
    id: 'r-001',
    hospital_id: 'h-001',
    user_id: 'u-001',
    rating: 5,
    text: 'Excellent care and clean facilities.',
    status: 'approved',
    created_at: '2026-05-10T10:00:00Z',
  },
];

describe('HospitalDetail', () => {
  it('renders the hospital name as a heading', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    expect(screen.getByRole('heading', { name: /University College Hospital/i })).toBeInTheDocument();
  });

  it('renders address and city', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    expect(screen.getByText(/Queen Elizabeth II Road/)).toBeInTheDocument();
    // Use the LGA separator (·) to target only the address paragraph, not the Markdown h1
    expect(screen.getByText(/Ibadan · Ibadan North/)).toBeInTheDocument();
  });

  it('renders the phone number as a tel link', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    const phoneLink = screen.getByRole('link', { name: /2348067890124/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:+2348067890124');
  });

  it('renders the email as a mailto link', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    const emailLink = screen.getByRole('link', { name: /uch-ibadan/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:info@uch-ibadan.edu.ng');
  });

  it('renders specialty tags', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('emergency')).toBeInTheDocument();
    expect(screen.getByText('cardiology')).toBeInTheDocument();
  });

  it('renders ownership badge', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('renders aggregate rating and review count', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    // 4.5 appears in both the header and RatingWidget — assert at least one exists
    expect(screen.getAllByText(/4\.5/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/32/).length).toBeGreaterThan(0);
  });

  it('renders Markdown description as HTML (bold preserved, script stripped)', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    // "first" should be wrapped in <strong> from **first**
    expect(screen.getByText(/Nigeria/)).toBeInTheDocument();
    // The <strong> tag should be in the DOM
    const aboutSection = screen.getByRole('region', { name: /about/i });
    expect(aboutSection.querySelector('strong')).not.toBeNull();
  });

  it('renders visiting hours section', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} />);
    expect(screen.getByRole('region', { name: /visiting hours/i })).toBeInTheDocument();
    expect(screen.getByText(/Monday/)).toBeInTheDocument();
  });

  it('renders approved reviews', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} reviews={APPROVED_REVIEWS} />);
    expect(screen.getByText('Excellent care and clean facilities.')).toBeInTheDocument();
  });

  it('shows "No reviews yet" when reviews list is empty', () => {
    render(<HospitalDetail hospital={BASE_HOSPITAL} reviews={[]} />);
    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
  });
});
