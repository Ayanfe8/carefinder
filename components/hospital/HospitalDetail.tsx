'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { Hospital, Review, HospitalImage } from '@/lib/types';

interface HospitalDetailProps {
  hospital: Hospital;
  images?: HospitalImage[];
  reviews?: Review[];
}

function safeMarkdownToHtml(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

function StarRating({ value, count }: { value: number; count: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center" aria-label={`${value.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-lg ${i < filled ? 'text-yellow-400' : 'text-gray-300'}`} aria-hidden>
            ★
          </span>
        ))}
      </span>
      <span className="text-sm text-gray-600">
        {value.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-gray-100 pb-4">
      <StarRating value={review.rating} count={1} />
      {review.text && <p className="text-sm text-gray-700 mt-2">{review.text}</p>}
      <p className="text-xs text-gray-400 mt-1">
        {new Date(review.created_at).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </article>
  );
}

export function HospitalDetail({ hospital, images = [], reviews = [] }: HospitalDetailProps) {
  const descriptionHtml = useMemo(
    () => (hospital.description_md ? safeMarkdownToHtml(hospital.description_md) : null),
    [hospital.description_md]
  );

  const visitingHoursHtml = useMemo(
    () => (hospital.visiting_hours ? safeMarkdownToHtml(hospital.visiting_hours) : null),
    [hospital.visiting_hours]
  );

  const supabaseStorageBase = process.env['NEXT_PUBLIC_SUPABASE_URL']
    ? `${process.env['NEXT_PUBLIC_SUPABASE_URL']}/storage/v1/object/public/hospital-images`
    : null;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>
            <p className="text-gray-500 mt-1">
              {hospital.address}, {hospital.city} · {hospital.lga}
            </p>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${
              hospital.ownership === 'public'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-purple-50 text-purple-700'
            }`}
          >
            {hospital.ownership === 'public' ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hospital.specialties.map((s) => (
            <span
              key={s}
              className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full capitalize"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <StarRating value={hospital.rating_avg} count={hospital.review_count} />
        </div>
      </header>

      {/* Photos */}
      {images.length > 0 && supabaseStorageBase && (
        <section aria-label="Hospital photos">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={`${supabaseStorageBase}/${img.storage_path}`}
                  alt={`Photo of ${hospital.name}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section aria-label="Contact information" className="bg-gray-50 rounded-xl p-5 space-y-2">
        <h2 className="font-semibold text-gray-800 mb-3">Contact</h2>
        <div className="text-sm space-y-1.5">
          <p>
            <span className="text-gray-500 w-16 inline-block">Phone</span>
            <a href={`tel:${hospital.phone}`} className="text-emerald-600 hover:underline">
              {hospital.phone}
            </a>
          </p>
          {hospital.email && (
            <p>
              <span className="text-gray-500 w-16 inline-block">Email</span>
              <a href={`mailto:${hospital.email}`} className="text-emerald-600 hover:underline">
                {hospital.email}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Visiting hours */}
      {visitingHoursHtml && (
        <section aria-label="Visiting hours">
          <h2 className="font-semibold text-gray-800 mb-3">Visiting Hours</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: visitingHoursHtml }}
          />
        </section>
      )}

      {/* Description */}
      {descriptionHtml && (
        <section aria-label="About this hospital">
          <h2 className="font-semibold text-gray-800 mb-3">About</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>
      )}

      {/* Reviews */}
      <section aria-label="Reviews">
        <h2 className="font-semibold text-gray-800 mb-4">
          Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to rate this hospital.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
