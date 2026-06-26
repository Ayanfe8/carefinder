'use client';

import { deleteHospitalAction } from '@/app/admin/actions';

interface Props {
  id: string;
  name: string;
}

export function DeleteHospitalForm({ id, name }: Props) {
  return (
    <form
      action={deleteHospitalAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-red-500 hover:text-red-700 font-medium"
      >
        Delete
      </button>
    </form>
  );
}
