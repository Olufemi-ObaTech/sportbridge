/**
 * Netlify Function: send-email
 * Accepts a POST from Supabase Auth hooks or internal calls to send
 * transactional emails via Brevo SMTP API.
 *
 * Environment variables required (set in Netlify UI):
 *   BREVO_API_KEY   — Brevo API key (v3 Transactional Emails API)
 *   MAIL_FROM_EMAIL — e.g. noreply@sportbridge.com.ng
 *   MAIL_FROM_NAME  — e.g. SportBridge
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export default async (request) => {
  // Only accept POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    })
  }

  const apiKey       = process.env.BREVO_API_KEY
  const fromEmail    = process.env.MAIL_FROM_EMAIL    || 'noreply@sportbridge.com.ng'
  const fromName     = process.env.MAIL_FROM_NAME     || 'SportBridge'

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { to, subject, html, text } = body

  if (!to || !subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html or text.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const payload = {
    sender:   { name: fromName, email: fromEmail },
    to:       Array.isArray(to) ? to : [{ email: to }],
    subject,
    htmlContent:  html  || undefined,
    textContent:  text  || undefined,
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method:  'POST',
      headers: {
        'api-key':      apiKey,
        'content-type': 'application/json',
        'accept':       'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('Brevo API error:', result)
      return new Response(JSON.stringify({ error: result.message || 'Email send failed.' }), {
        status: res.status,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, messageId: result.messageId }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('Email function error:', err)
    return new Response(JSON.stringify({ error: 'Internal error sending email.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
