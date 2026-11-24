/**
 * fix-demo-passwords.js
 * Sets correct passwords for all 5 demo accounts via Supabase Admin API.
 *
 * Run from project root:
 *   node supabase/fix-demo-passwords.js YOUR_SERVICE_ROLE_KEY
 *
 * Get service role key from:
 *   https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/settings/api
 *   → "service_role" (secret) key
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://qnueqhlxmtkvecppygrk.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2] // pass as first argument

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Usage: node supabase/fix-demo-passwords.js YOUR_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const DEMO_ACCOUNTS = [
  { email: 'marcus.thompson@sportbridge.demo',  password: 'Demo@SportBridge1!' },
  { email: 'carlos.mendes@sportbridge.demo',    password: 'Demo@SportBridge1!' },
  { email: 'scouting@global-talent.demo',       password: 'Demo@SportBridge1!' },
  { email: 'admin@elitelondonfc.demo',           password: 'Demo@SportBridge1!' },
  { email: 'sophie.laurent@sportbridge.demo',   password: 'Demo@SportBridge1!' },
]

async function fixPasswords() {
  console.log('🔧  Fixing demo account passwords via Supabase Admin API...\n')

  // Get all users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('❌  Could not list users:', listErr.message); process.exit(1) }

  for (const account of DEMO_ACCOUNTS) {
    const user = users.find(u => u.email === account.email)
    if (!user) {
      console.log(`⚠️   Not found in auth: ${account.email} — skipping`)
      continue
    }

    const { error } = await supabase.auth.admin.updateUser(user.id, {
      password:      account.password,
      email_confirm: true,
    })

    if (error) {
      console.error(`❌  Failed ${account.email}: ${error.message}`)
    } else {
      console.log(`✅  Fixed: ${account.email}`)
    }
  }

  console.log('\n✅  Done! All demo accounts can now log in with: Demo@SportBridge1!')
}

fixPasswords()
