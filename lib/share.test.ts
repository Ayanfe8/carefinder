import { describe, it, expect } from 'vitest';
import { encodeFilters, decodeFilters } from './share';
import type { FilterState } from './types';

const SITE = 'https://carefinder.ng';

describe('encodeFilters', () => {
  it('returns bare /search URL when all filters are empty', () => {
    expect(encodeFilters({}, SITE)).toBe('https://carefinder.ng/search');
  });

  it('encodes query param', () => {
    const url = encodeFilters({ q: 'Lagos' }, SITE);
    expect(new URL(url).searchParams.get('q')).toBe('Lagos');
  });

  it('encodes city param', () => {
    const url = encodeFilters({ city: 'Abuja' }, SITE);
    expect(new URL(url).searchParams.get('city')).toBe('Abuja');
  });

  it('encodes specialty array as repeated params', () => {
    const url = encodeFilters({ specialty: ['general', 'dental'] }, SITE);
    expect(new URL(url).searchParams.getAll('specialty')).toEqual(['general', 'dental']);
  });

  it('encodes ownership', () => {
    const url = encodeFilters({ ownership: 'public' }, SITE);
    expect(new URL(url).searchParams.get('ownership')).toBe('public');
  });

  it('encodes radius when provided', () => {
    const url = encodeFilters({ radius: 10 }, SITE);
    expect(new URL(url).searchParams.get('radius')).toBe('10');
  });

  it('omits radius when null', () => {
    const url = encodeFilters({ radius: null }, SITE);
    expect(new URL(url).searchParams.has('radius')).toBe(false);
  });

  it('encodes all filters together', () => {
    const filters: FilterState = {
      q: 'Hospital',
      city: 'Lagos',
      specialty: ['general', 'emergency'],
      ownership: 'private',
      radius: 5,
    };
    const sp = new URL(encodeFilters(filters, SITE)).searchParams;
    expect(sp.get('q')).toBe('Hospital');
    expect(sp.get('city')).toBe('Lagos');
    expect(sp.getAll('specialty')).toEqual(['general', 'emergency']);
    expect(sp.get('ownership')).toBe('private');
    expect(sp.get('radius')).toBe('5');
  });
});

describe('decodeFilters round-trip', () => {
  function roundTrip(filters: FilterState): FilterState {
    return decodeFilters(new URL(encodeFilters(filters, SITE)).searchParams);
  }

  it('round-trips empty filters', () => {
    const result = roundTrip({});
    expect(result.q).toBeUndefined();
    expect(result.city).toBeUndefined();
    expect(result.specialty).toEqual([]);
    expect(result.ownership).toBeNull();
    expect(result.radius).toBeNull();
  });

  it('round-trips a full filter object', () => {
    const filters: FilterState = {
      q: 'Teaching Hospital',
      city: 'Ibadan',
      specialty: ['general', 'emergency'],
      ownership: 'private',
      radius: 20,
    };
    const result = roundTrip(filters);
    expect(result.q).toBe('Teaching Hospital');
    expect(result.city).toBe('Ibadan');
    expect(result.specialty).toEqual(['general', 'emergency']);
    expect(result.ownership).toBe('private');
    expect(result.radius).toBe(20);
  });

  it('round-trips null radius as null', () => {
    expect(roundTrip({ radius: null }).radius).toBeNull();
  });

  it('round-trips specialty array with multiple values', () => {
    const result = roundTrip({ specialty: ['cardiology', 'dental', 'maternity'] });
    expect(result.specialty).toEqual(['cardiology', 'dental', 'maternity']);
  });

  it('round-trips private ownership', () => {
    expect(roundTrip({ ownership: 'private' }).ownership).toBe('private');
  });
});

describe('decodeFilters from Record', () => {
  it('handles a single specialty string', () => {
    const result = decodeFilters({ specialty: 'general' });
    expect(result.specialty).toEqual(['general']);
  });

  it('handles an array of specialties', () => {
    const result = decodeFilters({ specialty: ['general', 'dental'] });
    expect(result.specialty).toEqual(['general', 'dental']);
  });

  it('returns null ownership when absent', () => {
    expect(decodeFilters({}).ownership).toBeNull();
  });

  it('returns null radius when absent', () => {
    expect(decodeFilters({}).radius).toBeNull();
  });
});
