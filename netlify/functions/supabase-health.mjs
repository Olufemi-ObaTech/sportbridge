export default async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Supabase environment is not configured.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
      headers: { apikey: supabaseAnonKey },
    });

    return new Response(JSON.stringify({ ok: response.ok, status: response.status }), {
      status: response.ok ? 200 : 502,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Supabase is unreachable.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};
