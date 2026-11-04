/**
 * RegisterForm — unified single-page registration component.
 *
 * - Role selector writes profiles.role correctly via Supabase auth metadata
 * - sport defaults to 'football' always
 * - Basketball hidden behind BASKETBALL_ENABLED flag
 * - Password strength meter (min 12 chars)
 * - Contact-info blocked in full_name field
 * - Calls onSuccess(session) when auth session is created
 * - Calls onSwitchToSignIn() if user wants to sign in instead
 */

import { useState, useRef } from 'react'
import { BASKETBALL_ENABLED, containsContactInfo } from './lib/features.js'
import { supabase } from './lib/supabase.js'

// ── Role options ──────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  {
    value:   'player',
    label:   'Player',
    icon:    'bi-person-arms-up',
    colour:  '#2F7DF0',
    hint:    'Free forever. Build your public profile, upload full-match video and get discovered.',
  },
  {
    value:   'academy',
    label:   'Academy / Club',
    icon:    'bi-building',
    colour:  '#6f42c1',
    hint:    'Manage your squad roster, post jobs and tryouts, showcase your verified club worldwide.',
  },
  {
    value:   'agent',
    label:   'Agent / Scout',
    icon:    'bi-binoculars',
    colour:  '#198754',
    hint:    'Search verified players, build your watchlist, post opportunities and send access requests.',
  },
  {
    value:   'coach',
    label:   'Coach / Manager',
    icon:    'bi-clipboard2-pulse',
    colour:  '#F5B301',
    hint:    'Apply for coaching and director roles, recommend players, share achievements and courses.',
  },
  {
    value:   'sports_analyst',
    label:   'Sports Analyst',
    icon:    'bi-graph-up-arrow',
    colour:  '#fd7e14',
    hint:    'Build your analyst profile, apply for roles, recommend players and post match analyses.',
  },
]

const SPORTS = BASKETBALL_ENABLED
  ? [
      { value: 'football',   label: 'Football',   icon: 'bi-dribbble' },
      { value: 'basketball', label: 'Basketball', icon: 'bi-circle' },
    ]
  : [{ value: 'football', label: 'Football', icon: 'bi-dribbble' }]

// ── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw))   score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOUR = ['', '#dc3545', '#fd7e14', '#f5b301', '#198754']

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterForm({ onSuccess, onSwitchToSignIn, initialRole = 'player' }) {
  const [role,          setRole]          = useState(initialRole)
  const [sport,         setSport]         = useState('football')
  const [pwValue,       setPwValue]       = useState('')
  const [showPw,        setShowPw]        = useState(false)
  const [busy,          setBusy]          = useState(false)
  const [error,         setError]         = useState('')
  const [infoMsg,       setInfoMsg]       = useState('')
  const [confirmedEmail,setConfirmedEmail]= useState('')
  const [mode,          setMode]          = useState('form') // 'form' | 'confirm'
  const nameRef         = useRef(null)
  const strength        = passwordStrength(pwValue)

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMsg('')

    const fd       = new FormData(e.currentTarget)
    const fullName = String(fd.get('full_name') ?? '').trim()
    const email    = String(fd.get('email') ?? '').trim()
    const pw       = String(fd.get('password') ?? '')

    // Client-side validation
    if (!role) {
      setError('Please select your account type before continuing.')
      return
    }
    if (pw.length < 12) {
      setError('Password must be at least 12 characters.')
      return
    }
    if (containsContactInfo(fullName)) {
      setError('Please do not include phone numbers or email addresses in your name.')
      return
    }

    if (!supabase) {
      setError('Connection error — Supabase not configured. Please refresh and try again.')
      return
    }

    setBusy(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          data: {
            full_name: fullName,
            // role is written directly to profiles via handle_new_user() trigger
            role,
            // sport defaults to football; hidden if !BASKETBALL_ENABLED
            sport,
          },
        },
      })

      if (signUpError) {
        setError('Unable to create the account with these details. Check them and try again.')
        return
      }

      if (!data.session) {
        // Email confirmation required
        setConfirmedEmail(email)
        setMode('confirm')
        return
      }

      // Auto-confirmed — pass session up
      onSuccess?.(data.session)
    } catch {
      setError('Something went wrong. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    if (!supabase) return
    setBusy(true)
    setError('')
    try {
      const { error: resendError } = await supabase.auth.resend({
        type:  'signup',
        email: confirmedEmail,
      })
      setInfoMsg(resendError
        ? 'Could not resend — please try again in a few minutes.'
        : 'Confirmation email sent. Check your inbox and spam folder.')
    } catch {
      setInfoMsg('Could not resend — check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  // ── Confirm screen ──────────────────────────────────────────────────────────
  if (mode === 'confirm') {
    return (
      <div className="text-center p-4">
        <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 64, height: 64, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: '1.8rem' }}>
          <i className="bi bi-envelope-check" aria-hidden="true" />
        </div>
        <h2 className="h4 fw-bold mb-2">Check your inbox</h2>
        <p className="text-muted mb-1">
          We sent a confirmation link to <strong>{confirmedEmail}</strong>.
        </p>
        <p className="text-muted small mb-4">Can't find it? Check your spam / junk folder.</p>

        {error   && <div className="alert alert-danger mb-3 text-start" role="alert">{error}</div>}
        {infoMsg && <div className="alert alert-info  mb-3 text-start" role="status">{infoMsg}</div>}

        <button className="btn btn-outline-primary w-100 mb-2" type="button"
          onClick={handleResend} disabled={busy}>
          {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : 'Resend confirmation email'}
        </button>
        <button className="btn btn-link btn-sm text-muted" type="button"
          onClick={onSwitchToSignIn}>Back to sign in</button>
      </div>
    )
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div>
      <p className="small text-muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        Create account
      </p>
      <h2 className="h4 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>
        Join SportBridge
      </h2>

      {/* ── Step 1: Role selector ─────────────────────────────────────── */}
      <fieldset className="mb-4">
        <legend className="form-label fw-semibold mb-2" style={{ fontSize: 13 }}>
          I am joining as <span className="text-danger" aria-hidden="true">*</span>
        </legend>
        <div className="row g-2">
          {ROLE_OPTIONS.map((opt) => {
            const selected = role === opt.value
            return (
              <div className="col-6 col-sm-4" key={opt.value}>
                <button
                  type="button"
                  className={`w-100 h-100 rounded border p-2 d-flex flex-column align-items-center gap-1 text-center
                    ${selected ? 'border-primary shadow-sm' : 'border-secondary-subtle'}`}
                  style={{
                    background:  selected ? 'rgba(47,125,240,.08)' : 'transparent',
                    cursor:      'pointer',
                    transition:  'all .15s',
                    outline:     selected ? `2px solid ${opt.colour}` : 'none',
                    minHeight:   76,
                  }}
                  onClick={() => setRole(opt.value)}
                  aria-pressed={selected}
                >
                  <span className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 36, height: 36, background: selected ? opt.colour : '#e9ecef', color: selected ? '#fff' : '#495057', fontSize: '1.1rem', flexShrink: 0 }}>
                    <i className={`bi ${opt.icon}`} aria-hidden="true" />
                  </span>
                  <span className="fw-semibold" style={{ fontSize: 11, lineHeight: 1.3, color: selected ? opt.colour : 'inherit' }}>
                    {opt.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
        {selectedRole && (
          <div className="mt-2 small text-muted p-2 rounded" style={{ background: 'rgba(47,125,240,.06)', borderLeft: '3px solid var(--fc-blue-500)' }}>
            <i className="bi bi-info-circle me-1" />{selectedRole.hint}
          </div>
        )}
      </fieldset>

      {/* ── Step 2: Sport selector (hidden when basketball disabled) ────── */}
      {BASKETBALL_ENABLED && (
        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Sport</label>
          <div className="d-flex gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${sport === s.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSport(s.value)}
                aria-pressed={sport === s.value}
              >
                <i className={`bi ${s.icon}`} aria-hidden="true" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Account details ──────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            <i className="bi bi-exclamation-circle me-2" />{error}
          </div>
        )}

        {/* Full name */}
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="reg-full-name" style={{ fontSize: 13 }}>
            Full name{role === 'academy' ? ' / Club name' : ''}{' '}
            <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="reg-full-name"
            ref={nameRef}
            className="form-control"
            type="text"
            name="full_name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder={
              role === 'academy'         ? 'e.g. Elite London FC'     :
              role === 'agent'           ? 'e.g. Global Talent Agency' :
              'e.g. Marcus Thompson'
            }
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="reg-email" style={{ fontSize: 13 }}>
            Email address <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="reg-email"
            className="form-control"
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="reg-password" style={{ fontSize: 13 }}>
            Password <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <div className="input-group">
            <input
              id="reg-password"
              className="form-control"
              type={showPw ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              required
              minLength={12}
              placeholder="At least 12 characters"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((v) => !v)}
            >
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
            </button>
          </div>

          {/* Strength bar */}
          {pwValue.length > 0 && (
            <div className="mt-2">
              <div className="d-flex gap-1 mb-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex-fill rounded-pill" style={{ height: 4, background: n <= strength ? STRENGTH_COLOUR[strength] : '#dee2e6', transition: 'background .2s' }} />
                ))}
              </div>
              <div className="small" style={{ color: STRENGTH_COLOUR[strength] }}>
                {STRENGTH_LABEL[strength]}
                {strength < 2 && <span className="text-muted"> — Add uppercase, numbers and symbols for a stronger password</span>}
              </div>
            </div>
          )}
          <div className="form-text">Minimum 12 characters.</div>
        </div>

        {/* Safety note */}
        <div className="alert mb-3 p-2 d-flex gap-2" role="note"
          style={{ background: 'rgba(220,53,69,.06)', border: '1.5px solid rgba(220,53,69,.25)', borderRadius: 8 }}>
          <i className="bi bi-shield-check text-danger flex-shrink-0 mt-1" aria-hidden="true" />
          <div className="small">
            <strong>Never pay an agent or scout to arrange a trial.</strong> Legitimate agents never charge players.
            All contact is handled through the SportBridge secure inbox — your phone number and email are never shown publicly.
          </div>
        </div>

        <button
          className="btn btn-primary w-100 py-2"
          type="submit"
          disabled={busy || !role}
          style={{ fontWeight: 700, fontSize: 15 }}
        >
          {busy
            ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</>
            : <><i className="bi bi-person-plus me-2" />Create {selectedRole?.label ?? ''} account</>}
        </button>

        <p className="text-center small mt-3 mb-0">
          Already have an account?{' '}
          <button type="button" className="btn btn-link p-0 small" onClick={onSwitchToSignIn}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}
