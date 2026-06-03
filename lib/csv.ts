import Papa from 'papaparse';

export type ExportColumn = 'name' | 'address' | 'phone' | 'email' | 'specialties' | 'rating';

export const ALL_EXPORT_COLUMNS: ExportColumn[] = [
  'name',
  'address',
  'phone',
  'email',
  'specialties',
  'rating',
];

const COLUMN_HEADERS: Record<ExportColumn, string> = {
  name: 'Name',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  specialties: 'Specialties',
  rating: 'Rating',
};

export interface CSVHospital {
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  specialties: string[];
  rating_avg: number;
}

export function exportHospitalsCSV(
  hospitals: CSVHospital[],
  columns: ExportColumn[],
  query = ''
): void {
  const rows = hospitals.map((h) => {
    const row: Record<string, string> = {};
    for (const col of columns) {
      switch (col) {
        case 'name':
          row[COLUMN_HEADERS.name] = h.name;
          break;
        case 'address':
          row[COLUMN_HEADERS.address] = h.address;
          break;
        case 'phone':
          row[COLUMN_HEADERS.phone] = h.phone;
          break;
        case 'email':
          row[COLUMN_HEADERS.email] = h.email ?? '';
          break;
        case 'specialties':
          row[COLUMN_HEADERS.specialties] = h.specialties.join('; ');
          break;
        case 'rating':
          row[COLUMN_HEADERS.rating] = h.rating_avg.toFixed(1);
          break;
      }
    }
    return row;
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0]!;
  const slug =
    query.trim() === ''
      ? 'all'
      : query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = `hospitals-${slug}-${date}.csv`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCSVFilename(query: string): string {
  const date = new Date().toISOString().split('T')[0]!;
  const slug =
    query.trim() === ''
      ? 'all'
      : query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `hospitals-${slug}-${date}.csv`;
}
