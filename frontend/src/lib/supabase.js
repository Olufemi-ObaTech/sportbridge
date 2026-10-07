import { createClient } from '@supabase/supabase-js'

// The anon/public key is safe to include here — it is the browser-facing
// key intended for public use. It is NOT the service_role (admin) key.
// See: https://supabase.com/docs/guides/api/api-keys
const SUPABASE_URL  = 'https://pzfohowzaeunywaqukwe.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Zm9ob3d6YWV1bnl3YXF1a3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzQ0NTksImV4cCI6MjEwNTc1MDQ1OX0.kTcQgqGgB9Fgs9q_13PeQgzNxpuxH_foK8we5JrFZik'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL      || SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON

export const hasSupabaseConfig = true   // always configured — fallback guarantees it
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
