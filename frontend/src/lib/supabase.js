import { createClient } from '@supabase/supabase-js'

// VITE_SUPABASE_URL is non-secret — safe to have a fallback.
// VITE_SUPABASE_ANON_KEY must be set in Netlify → Environment variables.
// If missing, hasSupabaseConfig = false and the UI shows "database unavailable".
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://pzfohowzaeunywaqukwe.supabase.co'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
