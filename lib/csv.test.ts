import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportHospitalsCSV, buildCSVFilename } from './csv';
import type { CSVHospital } from './csv';
import Papa from 'papaparse';

const SAMPLE_HOSPITALS: CSVHospital[] = [
  {
    name: 'Lagos General Hospital',
    address: '1 Marina, Lagos Island',
    phone: '+2348001234567',
    email: 'info@lagosgeneral.gov.ng',
    specialties: ['general', 'emergency'],
    rating_avg: 4.2,
  },
  {
    name: 'St. Nicholas Hospital',
    address: '57 Campbell Street, Lagos Island',
    phone: '+2348012345670',
    email: null,
    specialties: ['maternity', 'pediatric'],
    rating_avg: 3.8,
  },
];

function setupDomMocks() {
  const anchor = { href: '', download: '', click: vi.fn() };
  vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLElement);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  return anchor;
}

// ─── Column filtering ────────────────────────────────────────────────────────

describe('exportHospitalsCSV — column selection', () => {
  let unparseSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setupDomMocks();
    unparseSpy = vi.spyOn(Papa, 'unparse');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function getPassedRows() {
    return unparseSpy.mock.calls[0]?.[0] as Record<string, string>[];
  }

  it('only exports selected columns — name and phone', () => {
    exportHospitalsCSV(SAMPLE_HOSPITALS, ['name', 'phone'], 'Lagos');
    const row = getPassedRows()[0]!;
    expect(Object.keys(row)).toContain('Name');
    expect(Object.keys(row)).toContain('Phone');
    expect(Object.keys(row)).not.toContain('Email');
    expect(Object.keys(row)).not.toContain('Address');
    expect(Object.keys(row)).not.toContain('Specialties');
    expect(Object.keys(row)).not.toContain('Rating');
  });

  it('exports all six columns when all are selected', () => {
    exportHospitalsCSV(
      SAMPLE_HOSPITALS,
      ['name', 'address', 'phone', 'email', 'specialties', 'rating'],
      ''
    );
    const row = getPassedRows()[0]!;
    expect(Object.keys(row)).toEqual(['Name', 'Address', 'Phone', 'Email', 'Specialties', 'Rating']);
  });

  it('joins specialties array as semicolon-separated string', () => {
    exportHospitalsCSV(SAMPLE_HOSPITALS, ['name', 'specialties'], '');
    const row = getPassedRows()[0]!;
    expect(row['Specialties']).toBe('general; emergency');
  });

  it('formats rating_avg to one decimal place', () => {
    exportHospitalsCSV(SAMPLE_HOSPITALS, ['name', 'rating'], '');
    const row = getPassedRows()[0]!;
    expect(row['Rating']).toBe('4.2');
  });

  it('outputs empty string for null email', () => {
    exportHospitalsCSV(SAMPLE_HOSPITALS, ['name', 'email'], '');
    const rows = getPassedRows();
    expect(rows[1]!['Email']).toBe('');
  });

  it('triggers a download via an <a> click', () => {
    const anchor = setupDomMocks();
    exportHospitalsCSV(SAMPLE_HOSPITALS, ['name'], 'Lagos');
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.download).toMatch(/^hospitals-lagos-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

// ─── Filename format ─────────────────────────────────────────────────────────

describe('buildCSVFilename — filename format', () => {
  it('includes query string and YYYY-MM-DD date', () => {
    const filename = buildCSVFilename('lagos');
    const today = new Date().toISOString().split('T')[0]!;
    expect(filename).toBe(`hospitals-lagos-${today}.csv`);
  });

  it('uses "all" when query is empty', () => {
    const filename = buildCSVFilename('');
    const today = new Date().toISOString().split('T')[0]!;
    expect(filename).toBe(`hospitals-all-${today}.csv`);
  });

  it('converts query to lowercase with hyphens', () => {
    const filename = buildCSVFilename('Port Harcourt');
    expect(filename).toMatch(/^hospitals-port-harcourt-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('replaces non-alphanumeric characters with hyphens', () => {
    const filename = buildCSVFilename('Lagos & Abuja!');
    // regex [^a-z0-9]+ collapses sequences of special chars
    expect(filename).toMatch(/^hospitals-lagos-abuja-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
