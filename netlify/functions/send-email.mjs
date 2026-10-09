/**
 * Netlify Function: send-email
 *
 * Dual-mode:
 *  A. Supabase Auth Hook — Supabase calls this automatically for every
 *     auth email (confirm signup, magic link, password reset, etc.)
 *     Payload: { user: { email }, email_data: { token, token_hash,
 *               redirect_to, email_action_type, site_url, token_new,
 *               token_hash_new } }
 *
 *  B. Direct call — any internal service can POST
 *     { to, subject, html, text }
 *
 * Required Netlify env vars:
 *   BREVO_API_KEY    — Brevo v3 API key (xkeysib-...)
 *   MAIL_FROM_EMAIL  — noreply@sportbridge.com.ng
 *   MAIL_FROM_NAME   — SportBridge
 *   SITE_URL         — https://sportbridge-com-ng.netlify.app
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

// ─── Build email content for Supabase auth events ─────────────────────────────
function buildAuthEmail(emailActionType, emailData, siteUrl) {
  const { token, token_hash, redirect_to } = emailData
  const base = redirect_to || siteUrl || 'https://sportbridge-com-ng.netlify.app'

  const confirmUrl  = `${(siteUrl || base).replace(/\/$/, '')}/auth/v1/verify?token=${token_hash}&type=${emailActionType}&redirect_to=${encodeURIComponent(base)}`

  const styles = `
    body { font-family: 'Inter', Arial, sans-serif; background: #F5F8FC; margin: 0; padding: 0; }
    .wrap { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(11,43,107,.10); }
    .header { background: linear-gradient(135deg,#2F7DF0,#123FAE); padding: 32px 36px 24px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; }
    .header p { color: rgba(255,255,255,.80); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 36px; color: #0B1220; }
    .body p { line-height: 1.6; font-size: 15px; color: #3B4A5A; }
    .btn { display: inline-block; margin: 24px 0 8px; padding: 14px 32px; background: linear-gradient(135deg,#2F7DF0,#123FAE); color: #fff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .footer { padding: 20px 36px; border-top: 1px solid #E7EFFC; font-size: 12px; color: #9AA6B8; }
    .footer a { color: #2F7DF0; text-decoration: none; }
  `

  switch (emailActionType) {
    case 'signup':
    case 'email_change_current':
    case 'email_change_new':
      return {
        subject: 'Confirm your SportBridge account',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>
          <div class="wrap">
            <div class="header"><h1>⚽ SportBridge</h1><p>The World's #1 Verified Football Network</p></div>
            <div class="body">
              <p>Hi there,</p>
              <p>Thanks for joining SportBridge. Click the button below to confirm your email address and activate your account.</p>
              <a href="${confirmUrl}" class="btn">Confirm my account</a>
              <p style="font-size:13px;color:#9AA6B8;">Or copy this link: <a href="${confirmUrl}" style="color:#2F7DF0;word-break:break-all;">${confirmUrl}</a></p>
              <p style="font-size:13px;color:#9AA6B8;">This link expires in 24 hours. If you didn't create a SportBridge account, you can safely ignore this email.</p>
            </div>
            <div class="footer">SportBridge · <a href="https://sportbridge-com-ng.netlify.app">sportbridge-com-ng.netlify.app</a><br>This is an automated message — please do not reply.</div>
          </div>
        </body></html>`,
      }

    case 'recovery':
      return {
        subject: 'Reset your SportBridge password',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>
          <div class="wrap">
            <div class="header"><h1>⚽ SportBridge</h1><p>Password Reset</p></div>
            <div class="body">
              <p>Hi there,</p>
              <p>We received a request to reset your SportBridge password. Click the button below to choose a new password.</p>
              <a href="${confirmUrl}" class="btn">Reset my password</a>
              <p style="font-size:13px;color:#9AA6B8;">Or copy this link: <a href="${confirmUrl}" style="color:#2F7DF0;word-break:break-all;">${confirmUrl}</a></p>
              <p style="font-size:13px;color:#9AA6B8;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">SportBridge · <a href="https://sportbridge-com-ng.netlify.app">sportbridge-com-ng.netlify.app</a></div>
          </div>
        </body></html>`,
      }

    case 'magiclink':
      return {
        subject: 'Your SportBridge sign-in link',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>
          <div class="wrap">
            <div class="header"><h1>⚽ SportBridge</h1><p>Magic Sign-In Link</p></div>
            <div class="body">
              <p>Hi there,</p>
              <p>Click the button below to sign in to SportBridge. This link works once and expires in 1 hour.</p>
              <a href="${confirmUrl}" class="btn">Sign in to SportBridge</a>
              <p style="font-size:13px;color:#9AA6B8;">If you didn't request this link, you can safely ignore this email.</p>
            </div>
            <div class="footer">SportBridge · <a href="https://sportbridge-com-ng.netlify.app">sportbridge-com-ng.netlify.app</a></div>
          </div>
        </body></html>`,
      }

    default:
      return {
        subject: 'SportBridge — Action required',
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>
          <div class="wrap">
            <div class="header"><h1>⚽ SportBridge</h1></div>
            <div class="body">
              <p>Click the link below to continue:</p>
              <a href="${confirmUrl}" class="btn">Continue</a>
            </div>
          </div>
        </body></html>`,
      }
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'content-type': 'application/json' },
    })
  }

  const apiKey      = process.env.BREVO_API_KEY
  const fromEmail   = process.env.MAIL_FROM_EMAIL  || 'noreply@sportbridge.com.ng'
  const fromName    = process.env.MAIL_FROM_NAME   || 'SportBridge'
  const siteUrl     = process.env.SITE_URL          || 'https://sportbridge-com-ng.netlify.app'

  if (!apiKey) {
    console.error('BREVO_API_KEY not set')
    return new Response(JSON.stringify({ error: 'Email service not configured.' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    })
  }

  let body
  try { body = await request.json() }
  catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }

  // ── Detect Supabase Auth Hook payload ─────────────────────────────────────
  let toEmail, subject, html, text
  if (body.user && body.email_data) {
    // Supabase Auth Hook format
    toEmail  = body.user.email
    const built = buildAuthEmail(body.email_data.email_action_type, body.email_data, siteUrl)
    subject  = built.subject
    html     = built.html
  } else {
    // Direct call format
    toEmail  = body.to
    subject  = body.subject
    html     = body.html
    text     = body.text
  }

  if (!toEmail || !subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    })
  }

  const payload = {
    sender:       { name: fromName, email: fromEmail },
    to:           Array.isArray(toEmail) ? toEmail : [{ email: toEmail }],
    subject,
    htmlContent:  html  || undefined,
    textContent:  text  || undefined,
  }

  try {
    const res = await fetch(BREVO_URL, {
      method:  'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', 'accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const result = await res.json()
    if (!res.ok) {
      console.error('Brevo error:', result)
      return new Response(JSON.stringify({ error: result.message || 'Send failed.' }), {
        status: res.status, headers: { 'content-type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ ok: true, messageId: result.messageId }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('send-email error:', err)
    return new Response(JSON.stringify({ error: 'Internal error.' }), {
      status: 500, headers: { 'content-type': 'application/json' },
    })
  }
}
