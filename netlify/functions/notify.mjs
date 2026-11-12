/**
 * Netlify Function: notify
 *
 * Sends transactional email notifications for SportBridge events.
 * Called by the React frontend or Supabase Database Webhooks.
 *
 * Required env vars:
 *   BREVO_API_KEY    — Brevo v3 API key
 *   MAIL_FROM_EMAIL  — noreply@sportbridge.online
 *   MAIL_FROM_NAME   — SportBridge
 *   SITE_URL         — https://sportbridge.online
 *   NOTIFY_SECRET    — shared secret to authenticate calls (optional but recommended)
 *
 * POST body:
 *   {
 *     type:      'verification_approved' | 'verification_rejected' | 'new_message' | 'access_granted' | 'access_denied',
 *     to:        'recipient@email.com',
 *     name:      'Recipient Name',    (optional)
 *     data:      { ... }             (type-specific data)
 *   }
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

// ─── Shared styles ─────────────────────────────────────────────────────────────
const CSS = `
  body { font-family: 'Inter', Arial, sans-serif; background: #F0F4FB; margin: 0; padding: 0; }
  .wrap { max-width: 540px; margin: 40px auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,43,107,.10); }
  .header { background: linear-gradient(135deg,#2F7DF0,#071a3d); padding: 28px 32px 22px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
  .header p { color: rgba(255,255,255,.75); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 28px 32px; color: #0B1220; }
  .body p { line-height: 1.65; font-size: 14px; color: #3B4A5A; margin: 0 0 16px; }
  .body h2 { font-size: 18px; font-weight: 800; color: #0B1220; margin: 0 0 12px; }
  .btn { display: inline-block; margin: 20px 0 8px; padding: 13px 28px; background: linear-gradient(135deg,#2F7DF0,#071a3d); color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .badge.success { background: #d1fae5; color: #065f46; }
  .badge.danger  { background: #fee2e2; color: #991b1b; }
  .badge.info    { background: #dbeafe; color: #1e40af; }
  .notice { background: #f0f9ff; border-left: 4px solid #2F7DF0; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #1e40af; }
  .footer { padding: 18px 32px; border-top: 1px solid #E7EFFC; font-size: 11px; color: #9AA6B8; }
  .footer a { color: #2F7DF0; text-decoration: none; }
`

function wrap(headerTitle, headerSub, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body>
  <div class="wrap">
    <div class="header">
      <h1>⚽ SportBridge</h1>
      <p>${headerSub || 'The Verified Football Network'}</p>
    </div>
    <div class="body">
      <h2>${headerTitle}</h2>
      ${bodyHtml}
    </div>
    <div class="footer">
      You received this email because you have a SportBridge account.
      <a href="https://sportbridge.online">sportbridge.online</a> · 
      <a href="https://sportbridge.online">Manage preferences</a>
    </div>
  </div>
  </body></html>`
}

// ─── Email templates ───────────────────────────────────────────────────────────
function buildEmail(type, name, data, siteUrl) {
  const greeting = name ? `Hi ${name},` : 'Hello,'
  const dash = `${siteUrl}/`

  switch (type) {

    case 'verification_approved':
      return {
        subject: '✅ Your SportBridge profile is now Verified',
        html: wrap('You\'re Verified!', 'Identity verification approved', `
          <p>${greeting}</p>
          <p>Great news — your SportBridge identity verification has been <strong>approved</strong>.</p>
          <span class="badge success">✓ Verified Member</span>
          <p style="margin-top:16px">Your verified badge is now live on your profile. You can now:</p>
          <ul style="font-size:14px;color:#3B4A5A;line-height:1.9">
            <li>Send and receive messages via the secure inbox</li>
            <li>View full profiles of verified coaches, agents and clubs</li>
            <li>Apply for jobs and tryouts with your verified profile</li>
          </ul>
          <a href="${dash}" class="btn">Go to your dashboard →</a>
        `),
      }

    case 'verification_rejected':
      return {
        subject: '⚠️ SportBridge verification — action needed',
        html: wrap('Verification needs attention', 'Please review your documents', `
          <p>${greeting}</p>
          <p>Your SportBridge verification submission could not be approved at this time.</p>
          <span class="badge danger">Not approved</span>
          ${data?.reason ? `<div class="notice"><strong>Reviewer note:</strong> ${data.reason}</div>` : ''}
          <p>Please log in to your dashboard, check the notes above, and re-submit with the correct documents.</p>
          <a href="${dash}" class="btn">Go to Get Verified tab →</a>
          <p style="font-size:12px;color:#9AA6B8">If you believe this is an error, reply to this email or contact us.</p>
        `),
      }

    case 'new_message':
      return {
        subject: `💬 New message on SportBridge from ${data?.senderName || 'a member'}`,
        html: wrap('You have a new message', 'Via the SportBridge secure inbox', `
          <p>${greeting}</p>
          <p><strong>${data?.senderName || 'A SportBridge member'}</strong> sent you a message.</p>
          ${data?.preview ? `<div class="notice">"${data.preview.slice(0, 120)}${data.preview.length > 120 ? '…' : ''}"</div>` : ''}
          <p>Log in to read the full message and reply. Never share personal contact details outside the SportBridge platform.</p>
          <a href="${dash}" class="btn">Open inbox →</a>
        `),
      }

    case 'access_granted':
      return {
        subject: '🔓 Profile access granted on SportBridge',
        html: wrap('Access request approved', 'Your contact access was granted', `
          <p>${greeting}</p>
          <p><strong>${data?.playerName || 'A player'}</strong> has approved your profile access request on SportBridge.</p>
          <p>You can now view their contact details and communicate securely via the inbox.</p>
          <a href="${dash}" class="btn">View profile →</a>
        `),
      }

    case 'access_denied':
      return {
        subject: 'ℹ️ Profile access request on SportBridge',
        html: wrap('Access request declined', '', `
          <p>${greeting}</p>
          <p>Your access request for <strong>${data?.playerName || "a player's"}</strong> profile was not approved at this time.</p>
          <p>You can search for other players or send a direct message via the inbox to introduce yourself.</p>
          <a href="${dash}" class="btn">Search players →</a>
        `),
      }

    default:
      return null
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'content-type': 'application/json' },
    })
  }

  const apiKey    = process.env.BREVO_API_KEY
  const fromEmail = process.env.MAIL_FROM_EMAIL || 'noreply@sportbridge.online'
  const fromName  = process.env.MAIL_FROM_NAME  || 'SportBridge'
  const siteUrl   = process.env.SITE_URL         || 'https://sportbridge.online'
  const secret    = process.env.NOTIFY_SECRET

  // Validate secret if configured
  if (secret) {
    const auth = request.headers.get('x-notify-secret')
    if (auth !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401, headers: { 'content-type': 'application/json' },
      })
    }
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured.' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    })
  }

  let body
  try { body = await request.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), { status: 400, headers: { 'content-type': 'application/json' } }) }

  const { type, to, name, data } = body

  if (!type || !to) {
    return new Response(JSON.stringify({ error: 'Missing required fields: type, to.' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }

  const email = buildEmail(type, name, data, siteUrl)
  if (!email) {
    return new Response(JSON.stringify({ error: `Unknown notification type: ${type}` }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }

  const payload = {
    sender:      { name: fromName, email: fromEmail },
    to:          [{ email: to, name: name || undefined }],
    subject:     email.subject,
    htmlContent: email.html,
  }

  try {
    const res = await fetch(BREVO_URL, {
      method:  'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', 'accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || `Brevo error ${res.status}`)
    return new Response(JSON.stringify({ ok: true, messageId: result.messageId }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('notify function error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502, headers: { 'content-type': 'application/json' },
    })
  }
}
