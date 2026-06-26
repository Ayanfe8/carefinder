'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { sanitizeMarkdown } from '@/lib/sanitize';
import { RatingWidget } from '@/components/hospital/RatingWidget';
import type { Hospital, Review, HospitalImage } from '@/lib/types';

interface HospitalDetailProps {
  hospital: Hospital;
  images?: HospitalImage[];
  reviews?: Review[];
}

function StarRating({ value, count }: { value: number; count: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex items-center"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`text-lg ${i < filled ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-hidden
          >
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
  const reviewer = review.user_id
    ? `${review.user_id.slice(0, 8)}…`
    : 'Anonymous';
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
      aria-hidden
    >
      ★
    </span>
  ));
  return (
    <article className="border-b border-gray-100 pb-4">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="flex items-center"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {stars}
        </span>
        <span className="text-xs text-gray-400">{reviewer}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      {review.text && (
        <p className="text-sm text-gray-700 mt-1">{review.text}</p>
      )}
    </article>
  );
}

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
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

export function HospitalDetail({
  hospital,
  images = [],
  reviews = [],
}: HospitalDetailProps) {
  const descriptionHtml = useMemo(
    () =>
      hospital.description_md
        ? sanitizeMarkdown(hospital.description_md)
        : null,
    [hospital.description_md]
  );

  const visitingHoursHtml = useMemo(
    () =>
      hospital.visiting_hours
        ? sanitizeMarkdown(hospital.visiting_hours)
        : null,
    [hospital.visiting_hours]
  );

  const supabaseStorageBase = process.env['NEXT_PUBLIC_SUPABASE_URL']
    ? `${process.env['NEXT_PUBLIC_SUPABASE_URL']}/storage/v1/object/public/hospital-images`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back to search */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Link>

        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {hospital.name}
              </h1>
              <p className="text-gray-500 mt-1">
                {hospital.address}, {hospital.city} · {hospital.lga}
              </p>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                hospital.ownership === 'public'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {hospital.ownership === 'public' ? 'Public' : 'Private'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {hospital.specialties.map((s: string) => (
              <span
                key={s}
                className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full capitalize"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <StarRating
              value={hospital.rating_avg}
              count={hospital.review_count}
            />
          </div>

          <a
            href={`tel:${hospital.phone}`}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call {hospital.phone}
          </a>
        </header>

        {/* Photos */}
        {images.length > 0 && supabaseStorageBase && (
          <section
            aria-label="Hospital photos"
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img: HospitalImage) => (
                <div
                  key={img.id}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                >
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
        <section
          aria-label="Contact information"
          className="bg-white rounded-xl border border-gray-200 p-5 space-y-2"
        >
          <h2 className="font-semibold text-gray-800 mb-3">Contact</h2>
          <div className="text-sm space-y-1.5">
            <p>
              <span className="text-gray-500 w-16 inline-block">Phone</span>
              <a
                href={`tel:${hospital.phone}`}
                className="text-emerald-600 hover:underline"
              >
                {hospital.phone}
              </a>
            </p>
            {hospital.email && (
              <p>
                <span className="text-gray-500 w-16 inline-block">Email</span>
                <a
                  href={`mailto:${hospital.email}`}
                  className="text-emerald-600 hover:underline"
                >
                  {hospital.email}
                </a>
              </p>
            )}
          </div>
        </section>

        {/* Visiting hours */}
        {visitingHoursHtml && (
          <section
            aria-label="Visiting hours"
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h2 className="font-semibold text-gray-800 mb-3">Visiting Hours</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: visitingHoursHtml }}
            />
          </section>
        )}

        {/* Description */}
        {descriptionHtml && (
          <section
            aria-label="About this hospital"
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h2 className="font-semibold text-gray-800 mb-3">About</h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
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
        <section
          aria-label="Reviews"
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h2 className="font-semibold text-gray-800 mb-4">
            Reviews{' '}
            {reviews.length > 0 && (
              <span className="text-gray-400 font-normal">
                ({reviews.length})
              </span>
            )}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              No reviews yet. Be the first to rate this hospital.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: Review) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
