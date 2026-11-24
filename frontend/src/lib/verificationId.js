/**
 * verificationId.js
 * Generates a deterministic, human-readable SportBridge Verification ID
 * from a user's UUID. Format: SB-XXXX-XXXX (e.g. SB-A3F7-2B19)
 *
 * - Always the same for the same user ID
 * - No database column needed — computed on the fly
 * - Displayed on verified member dashboards and profiles
 */

const CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no I, O to avoid confusion

/**
 * Converts a UUID string into a deterministic 8-char alphanumeric code.
 * @param {string} uuid — user's profile ID
 * @returns {string} — e.g. "SB-A3F7-2B19"
 */
export function generateVerificationId(uuid) {
  if (!uuid) return 'SB-0000-0000'

  // Use the hex chars of the UUID (strip dashes)
  const hex = uuid.replace(/-/g, '')

  // Convert hex pairs to numbers and map to our character set
  let code = ''
  for (let i = 0; i < 8; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    code += CHARS[byte % CHARS.length]
  }

  return `SB-${code.slice(0, 4)}-${code.slice(4, 8)}`
}

/**
 * Returns the full verification display string for a role.
 * @param {string} role
 * @param {string} uuid
 * @returns {string} — e.g. "Verified Player · SB-A3F7-2B19"
 */
export function getVerificationDisplay(role, uuid) {
  const id = generateVerificationId(uuid)
  const labels = {
    player:         'Verified Player',
    coach:          'Verified Coach',
    agent:          'Verified Agent',
    academy:        'Verified Club / Academy',
    sports_analyst: 'Verified Sports Analyst',
    super_admin:    'SportBridge Admin',
  }
  return `${labels[role] ?? 'Verified Member'} · ${id}`
}
