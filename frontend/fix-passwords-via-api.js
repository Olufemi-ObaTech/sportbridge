/**
 * fix-passwords-via-api.js
 * Run with: node supabase/fix-passwords-via-api.js
 *
 * Uses the Supabase Admin API (service_role key) to set passwords correctly.
 * The SQL crypt() approach creates $2a$ bcrypt hashes which are NOT compatible
 * with Supabase's GoTrue auth — GoTrue expects passwords set via the Admin API.
 *
 * Run this once from your local machine (where SUPABASE_SERVICE_ROLE_KEY is set in .env).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually (no dotenv needed — just parse the file)
const envPath = resolve(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, '')]
    })
)

const SUPABASE_URL          = env.SUPABASE_URL
const SUPABASE_SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const ACCOUNTS = [
  { email: 'sportbridge.com.ng@gmail.com',          password: 'SportBridge2026!' },
  { email: 'admin@lagosunitedfc.ng',                password: 'Demo@1234!' },
  { email: 'info@ekosportsacademy.ng',              password: 'Demo@1234!' },
  { email: 'scouting@premierfootballagency.ng',     password: 'Demo@1234!' },
  { email: 'chukwuemeka.okafor@sportbridge.ng',     password: 'Demo@1234!' },
  { email: 'adewale.ibrahim@sportbridge.ng',        password: 'Demo@1234!' },
  { email: 'emeka.nwosu@sportbridge.ng',            password: 'Demo@1234!' },
  { email: 'babatunde.adeleke@sportbridge.ng',      password: 'Demo@1234!' },
  { email: 'david.eze@sportbridge.ng',              password: 'Demo@1234!' },
  { email: 'samuel.okonkwo@sportbridge.ng',         password: 'Demo@1234!' },
  { email: 'ibrahim.musa@sportbridge.ng',           password: 'Demo@1234!' },
  { email: 'chisom.agu@sportbridge.ng',             password: 'Demo@1234!' },
  { email: 'tunde.salami@sportbridge.ng',           password: 'Demo@1234!' },
  { email: 'kelechi.obiora@sportbridge.ng',         password: 'Demo@1234!' },
]

async function run() {
  console.log(`Connecting to ${SUPABASE_URL}...`)

  // First get all users to find their IDs
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 100 })
  if (listErr) { console.error('Failed to list users:', listErr.message); process.exit(1) }

  console.log(`Found ${users.length} users in Supabase Auth.\n`)

  let success = 0
  let notFound = 0

  for (const account of ACCOUNTS) {
    const user = users.find(u => u.email === account.email)
    if (!user) {
      console.log(`  ⚠️  NOT FOUND: ${account.email}`)
      notFound++
      continue
    }

    const { error } = await supabase.auth.admin.updateUser(user.id, {
      password:           account.password,
      email_confirm:      true,
    })

    if (error) {
      console.log(`  ❌ FAILED: ${account.email} — ${error.message}`)
    } else {
      console.log(`  ✅ Updated: ${account.email}`)
      success++
    }
  }

  console.log(`\nDone. ${success} updated, ${notFound} not found.`)

  if (notFound > 0) {
    console.log('\nAccounts not found need to be created via the site signup form first.')
    console.log('Or run seed.sql in Supabase SQL Editor to create them.')
  }
}

run().catch(console.error)
