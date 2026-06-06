import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ShareRequestSchema } from '@/lib/schemas';
import { createServiceClient } from '@/lib/supabase/server';

const resend = new Resend(process.env['RESEND_API_KEY']);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = ShareRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    );
  }

  const { to, hospitalIds, senderName } = parsed.data;

  const supabase = createServiceClient();
  const { data: hospitals, error: dbError } = await supabase
    .from('hospitals')
    .select('id, name, address, city, lga, phone, email, specialties, ownership')
    .in('id', hospitalIds)
    .eq('status', 'published');

  if (dbError) {
    return NextResponse.json({ error: 'Failed to fetch hospital data' }, { status: 500 });
  }

  if (!hospitals || hospitals.length === 0) {
    return NextResponse.json({ error: 'No valid hospitals found' }, { status: 400 });
  }

  const subject = senderName
    ? `${senderName} shared a hospital list with you`
    : 'A hospital list shared via Carefinder';

  const { error: sendError } = await resend.emails.send({
    from: 'Carefinder <onboarding@resend.dev>',
    to,
    subject,
    html: buildEmailHtml(hospitals, senderName),
  });

  if (sendError) {
    if (sendError.statusCode === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}

type HospitalRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  phone: string;
  email: string | null;
  specialties: string[];
  ownership: string;
};

function buildEmailHtml(hospitals: HospitalRow[], senderName?: string): string {
  const greeting = senderName
    ? `<p style="font-size:16px;color:#374151;margin:0 0 16px;">
        <strong>${esc(senderName)}</strong> found these hospitals for you using Carefinder.
       </p>`
    : `<p style="font-size:16px;color:#374151;margin:0 0 16px;">
        Here is a hospital list shared via Carefinder.
       </p>`;

  const cards = hospitals
    .map(
      (h) => `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px;">${esc(h.name)}</h2>
        <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">
          ${esc(h.address)}, ${esc(h.city)}, ${esc(h.lga)}
        </p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;">
          <strong>Phone:</strong> ${esc(h.phone)}${h.email ? ` &nbsp;·&nbsp; <strong>Email:</strong> ${esc(h.email)}` : ''}
        </p>
        ${
          h.specialties.length > 0
            ? `<div style="margin-top:8px;">
                 ${h.specialties
                   .map(
                     (s) =>
                       `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;padding:2px 10px;border-radius:9999px;margin:2px 4px 2px 0;">${esc(s)}</span>`
                   )
                   .join('')}
               </div>`
            : ''
        }
        <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;text-transform:capitalize;">
          ${esc(h.ownership)} hospital
        </p>
      </div>`
    )
    .join('');

  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://carefinder.vercel.app';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Hospital list from Carefinder</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <div style="background:#059669;padding:24px 32px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Carefinder</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#a7f3d0;">Nigeria&rsquo;s hospital directory</p>
    </div>

    <div style="padding:32px;">
      ${greeting}
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">
        ${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} included
      </p>

      ${cards}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">
        Shared via <a href="${siteUrl}" style="color:#059669;text-decoration:none;">Carefinder</a>
        &mdash; Nigeria&rsquo;s civic hospital directory.
      </p>
    </div>

  </div>
</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
