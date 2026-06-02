'use client';

import { useState } from 'react';
import { exportHospitalsCSV, ALL_EXPORT_COLUMNS } from '@/lib/csv';
import type { ExportColumn, CSVHospital } from '@/lib/csv';

const COLUMN_LABELS: Record<ExportColumn, string> = {
  name: 'Name',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  specialties: 'Specialties',
  rating: 'Rating',
};

interface ExportButtonProps {
  hospitals: CSVHospital[];
  query?: string;
}

export function ExportButton({ hospitals, query = '' }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExportColumn[]>([
    'name',
    'address',
    'phone',
    'specialties',
  ]);

  const toggleColumn = (col: ExportColumn) => {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleExport = () => {
    exportHospitalsCSV(hospitals, selected, query);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-gray-600 hover:text-emerald-600 border border-gray-300 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
        aria-label={`Export ${hospitals.length} hospitals as CSV`}
      >
        Export CSV
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export column selection"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 max-w-full">
            <h2 className="font-semibold text-gray-900 mb-4">Select columns to export</h2>

            <fieldset className="space-y-2 mb-6">
              <legend className="sr-only">CSV columns</legend>
              {ALL_EXPORT_COLUMNS.map((col) => (
                <label key={col} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(col)}
                    onChange={() => toggleColumn(col)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">{COLUMN_LABELS[col]}</span>
                </label>
              ))}
            </fieldset>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={selected.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                aria-label={`Download CSV with ${selected.length} column${selected.length !== 1 ? 's' : ''}`}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
