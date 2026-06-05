import type { Hospital } from '@/lib/types';

interface AdminEntryFormProps {
  hospital?: Hospital;
}

// Full implementation in Section 3.3 (React Hook Form + Zod + React-MD-Editor).
export function AdminEntryForm({ hospital }: AdminEntryFormProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
      <p>Hospital entry form — coming in Section 3.3</p>
      {hospital && (
        <p className="mt-2 text-xs text-gray-300">Editing: {hospital.name}</p>
      )}
    </div>
  );
}
