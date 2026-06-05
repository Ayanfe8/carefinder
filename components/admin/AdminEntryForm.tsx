'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HospitalInputSchema, type HospitalInput } from '@/lib/schemas';
import type { Hospital } from '@/lib/types';
import { createHospitalAction, updateHospitalAction } from '@/app/admin/actions';
import { createClient } from '@/lib/supabase/client';

const COMMON_SPECIALTIES = [
  'General Medicine',
  'Surgery',
  'Paediatrics',
  'Obstetrics & Gynaecology',
  'Cardiology',
  'Neurology',
  'Orthopaedics',
  'Ophthalmology',
  'ENT',
  'Emergency Medicine',
  'Psychiatry',
  'Dental',
  'Radiology',
  'Dermatology',
  'Urology',
  'Physiotherapy',
];

interface Props {
  hospital?: Hospital;
}

export function AdminEntryForm({ hospital }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HospitalInput>({
    resolver: zodResolver(HospitalInputSchema),
    defaultValues: hospital
      ? {
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          lga: hospital.lga,
          phone: hospital.phone,
          email: hospital.email ?? '',
          specialties: hospital.specialties,
          ownership: hospital.ownership,
          description_md: hospital.description_md ?? '',
          visiting_hours: hospital.visiting_hours ?? '',
        }
      : {
          specialties: [],
          ownership: 'public',
          description_md: '',
          visiting_hours: '',
        },
  });

  const specialties = watch('specialties');

  function addSpecialty(s: string) {
    const trimmed = s.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setValue('specialties', [...specialties, trimmed], { shouldValidate: true });
    }
    setSpecialtyInput('');
  }

  function removeSpecialty(s: string) {
    setValue(
      'specialties',
      specialties.filter((x) => x !== s),
      { shouldValidate: true }
    );
  }

  async function onSubmit(data: HospitalInput) {
    setSubmitting(true);
    setFormError(null);
    try {
      const { id: hospitalId } = hospital
        ? await updateHospitalAction(hospital.id, data)
        : await createHospitalAction(data);

      if (imageFile) {
        const supabase = createClient();
        const path = `hospital-images/${hospitalId}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('hospital-images')
          .upload(path, imageFile);
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        await supabase.from('hospital_images').insert({
          hospital_id: hospitalId,
          storage_path: path,
        });
      }

      router.push('/admin/dashboard');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'An unexpected error occurred');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              {...register('name')}
              placeholder="Lagos Island General Hospital"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('city')}
              placeholder="Lagos"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            {...register('address')}
            placeholder="1 Hospital Road, Lagos Island"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LGA *
          </label>
          <input
            {...register('lga')}
            placeholder="Lagos Island"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.lga && (
            <p className="mt-1 text-xs text-red-500">{errors.lga.message}</p>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Contact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              {...register('phone')}
              placeholder="+2348012345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="info@hospital.ng"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Classification */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Classification
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ownership *
          </label>
          <div className="flex gap-6">
            {(['public', 'private'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  {...register('ownership')}
                  type="radio"
                  value={v}
                  className="accent-emerald-600"
                />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
          {errors.ownership && (
            <p className="mt-1 text-xs text-red-500">{errors.ownership.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialties *{' '}
            <span className="font-normal text-gray-400">
              ({specialties.length} selected)
            </span>
          </label>

          {/* Quick-add buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_SPECIALTIES.filter((s) => !specialties.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSpecialty(s)}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>

          {/* Selected tags */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(s)}
                    className="hover:text-red-500 font-bold leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Custom specialty input */}
          <div className="flex gap-2">
            <input
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialty(specialtyInput);
                }
              }}
              placeholder="Add custom specialty…"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => addSpecialty(specialtyInput)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>

          {errors.specialties && (
            <p className="mt-1 text-xs text-red-500">{errors.specialties.message}</p>
          )}
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Location
        </h2>
        {hospital && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Coordinates must be re-entered when editing — they are not stored in a
            retrievable format. Use Google Maps to find the hospital&apos;s coordinates.
          </p>
        )}
        <p className="text-xs text-gray-500">
          Nigeria bounds: latitude 4–14°N, longitude 2–15°E
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              {...register('latitude', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="6.4550"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.latitude && (
              <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              {...register('longitude', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="3.3841"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.longitude && (
              <p className="mt-1 text-xs text-red-500">{errors.longitude.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Description
        </h2>
        <p className="text-xs text-gray-500">Markdown supported.</p>
        <textarea
          {...register('description_md')}
          rows={8}
          placeholder="Describe the hospital's services, history, and facilities…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
        />
        {errors.description_md && (
          <p className="text-xs text-red-500">{errors.description_md.message}</p>
        )}
      </section>

      {/* Visiting Hours */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Visiting Hours
        </h2>
        <p className="text-xs text-gray-500">Markdown supported.</p>
        <textarea
          {...register('visiting_hours')}
          rows={5}
          placeholder={'**Mon–Fri** 8am–6pm\n**Sat–Sun** 10am–4pm'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
        />
        {errors.visiting_hours && (
          <p className="text-xs text-red-500">{errors.visiting_hours.message}</p>
        )}
      </section>

      {/* Image Upload */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Image
        </h2>
        <p className="text-xs text-gray-500">
          Optional. Uploaded directly to Supabase Storage after save.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        {imageFile && (
          <p className="text-xs text-gray-500">Selected: {imageFile.name}</p>
        )}
      </section>

      {/* Form-level error */}
      {formError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <a
          href="/admin/dashboard"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg transition-colors"
        >
          {submitting ? 'Saving…' : hospital ? 'Update Hospital' : 'Create Hospital'}
        </button>
      </div>
    </form>
  );
}
