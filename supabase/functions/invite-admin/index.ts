// Supabase Edge Function: invite-admin
// Creates a new Supabase Auth user and inserts a row in public.users with role='admin'.
//
// Protected by SUPABASE_SERVICE_ROLE_KEY — only callable server-side.
// The caller must include: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
//
// Deploy: supabase functions deploy invite-admin
// Invoke:  supabase functions invoke invite-admin \
//            --body '{"email":"admin@example.com","password":"..."}' \
//            --header 'Authorization: Bearer <service_role_key>'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify the caller supplied the service role key.
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';
  const callerToken = authHeader.replace(/^Bearer\s+/i, '');

  if (!serviceRoleKey || callerToken !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let email: string;
  let password: string;
  try {
    const body = await req.json() as { email?: string; password?: string };
    email = (body.email ?? '').trim();
    password = body.password ?? '';
    if (!email || !password) throw new Error('missing fields');
  } catch {
    return new Response(JSON.stringify({ error: 'email and password are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Create the auth user.
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: authError?.message ?? 'Failed to create auth user' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Insert a row in public.users so the JWT hook can inject role='admin'.
  const { error: insertError } = await adminClient
    .from('users')
    .insert({ id: authData.user.id, email, role: 'admin' });

  if (insertError) {
    // Roll back: delete the auth user to avoid orphaned accounts.
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ id: authData.user.id, email, role: 'admin' }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
