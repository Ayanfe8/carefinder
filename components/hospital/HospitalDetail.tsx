'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { sanitizeMarkdown } from '@/lib/sanitize';
import { RatingWidget } from '@/components/hospital/RatingWidget';
import type { Hospital, Review, HospitalImage } from '@/lib/types';

function getSpecialtyBadgeColor(specialty: string): { bg: string; text: string } {
  const normalized = specialty.toLowerCase();

  if (normalized.includes('cardiology') || normalized === 'general') {
    return { bg: 'bg-blue-100', text: 'text-blue-800' };
  }
  if (normalized.includes('maternity') || normalized.includes('obstetric')) {
    return { bg: 'bg-pink-50', text: 'text-pink-800' };
  }
  if (normalized.includes('emergency')) {
    return { bg: 'bg-red-100', text: 'text-red-700' };
  }
  if (normalized.includes('dental')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800' };
  }
  if (normalized.includes('pediatric')) {
    return { bg: 'bg-blue-50', text: 'text-blue-700' };
  }

  return { bg: 'bg-blue-100', text: 'text-blue-800' };
}

interface HospitalDetailProps {
  hospital: Hospital;
  images?: HospitalImage[];
  reviews?: Review[];
}

function StarRating({ value, count }: { value: number; count: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center" aria-label={`${value.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-lg ${i < filled ? 'text-amber-500' : 'text-slate-300'}`} aria-hidden>
            ★
          </span>
        ))}
      </span>
      <span className="text-sm text-slate-600">
        {value.toFixed(1)} ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const reviewer = review.user_id ? `${review.user_id.slice(0, 8)}…` : 'Anonymous';
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < review.rating ? 'text-amber-500' : 'text-slate-300'} aria-hidden>
      ★
    </span>
  ));
  return (
    <article className="border-b border-slate-100 pb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center" aria-label={`${review.rating} out of 5 stars`}>
          {stars}
        </span>
        <span className="text-xs text-slate-400">{reviewer}</span>
        <span className="text-xs text-slate-300">·</span>
        <span className="text-xs text-slate-400">
          {new Date(review.created_at).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      {review.text && <p className="text-sm text-slate-700 mt-1">{review.text}</p>}
    </article>
  );
}

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export function HospitalDetail({ hospital, images = [], reviews = [] }: HospitalDetailProps) {
  const descriptionHtml = useMemo(
    () => (hospital.description_md ? sanitizeMarkdown(hospital.description_md) : null),
    [hospital.description_md]
  );

  const visitingHoursHtml = useMemo(
    () => (hospital.visiting_hours ? sanitizeMarkdown(hospital.visiting_hours) : null),
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
            <h1 className="text-3xl font-bold text-slate-900">{hospital.name}</h1>
            <p className="text-slate-500 mt-1">
              {hospital.address}, {hospital.city} · {hospital.lga}
            </p>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 border ${
              hospital.ownership === 'public'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-green-100 text-green-800 border-green-200'
            }`}
          >
            {hospital.ownership === 'public' ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hospital.specialties.map((s: string) => {
            const colors = getSpecialtyBadgeColor(s);
            return (
              <span
                key={s}
                className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${colors.bg} ${colors.text}`}
              >
                {s}
              </span>
            );
          })}
        </div>

        <div className="mt-4">
          <StarRating value={hospital.rating_avg} count={hospital.review_count} />
        </div>
      </header>

      {/* Photos */}
      {images.length > 0 && supabaseStorageBase && (
        <section aria-label="Hospital photos">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img: HospitalImage) => (
              <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <ImageWithSkeleton
                  src={`${supabaseStorageBase}/${img.storage_path}`}
                  alt={`Photo of ${hospital.name}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section aria-label="Contact information" className="bg-slate-50 rounded-xl p-5 space-y-2">
        <h2 className="font-semibold text-slate-800 mb-3">Contact</h2>
        <div className="text-sm space-y-1.5">
          <p>
            <span className="text-slate-500 w-16 inline-block">Phone</span>
            <a href={`tel:${hospital.phone}`} className="text-blue-700 hover:underline font-medium">
              {hospital.phone}
            </a>
          </p>
          {hospital.email && (
            <p>
              <span className="text-slate-500 w-16 inline-block">Email</span>
              <a href={`mailto:${hospital.email}`} className="text-blue-700 hover:underline font-medium">
                {hospital.email}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Visiting hours */}
      {visitingHoursHtml && (
        <section aria-label="Visiting hours">
          <h2 className="font-semibold text-slate-800 mb-3">Visiting Hours</h2>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: visitingHoursHtml }}
          />
        </section>
      )}

      {/* Description */}
      {descriptionHtml && (
        <section aria-label="About this hospital">
          <h2 className="font-semibold text-slate-800 mb-3">About</h2>
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>
      )}

      {/* Rating widget */}
      <RatingWidget
        hospitalId={hospital.id}
        ratingAvg={hospital.rating_avg}
        reviewCount={hospital.review_count}
      />

      {/* Reviews */}
      <section aria-label="Reviews">
        <h2 className="font-semibold text-slate-800 mb-4">
          Reviews {reviews.length > 0 && <span className="text-slate-400 font-normal">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews yet. Be the first to rate this hospital.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: Review) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
