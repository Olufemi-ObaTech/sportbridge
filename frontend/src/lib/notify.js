/**
 * notify.js — Calls the Netlify /notify function for transactional emails.
 *
 * Usage:
 *   import { sendNotification } from './lib/notify'
 *   await sendNotification('verification_approved', { to: 'user@email.com', name: 'John' })
 *   await sendNotification('new_message', { to: 'user@email.com', data: { senderName: 'Club X', preview: '...' } })
 */

const NOTIFY_URL = import.meta.env.VITE_NOTIFY_URL || '/.netlify/functions/notify'

/**
 * @param {string} type - notification type
 * @param {{ to: string, name?: string, data?: object }} opts
 * @returns {Promise<boolean>} true if sent successfully
 */
export async function sendNotification(type, { to, name, data } = {}) {
  if (!to) return false
  try {
    const res = await fetch(NOTIFY_URL, {
      method:  'POST',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify({ type, to, name, data }),
    })
    return res.ok
  } catch (err) {
    console.warn('sendNotification failed (non-critical):', err.message)
    return false
  }
}
