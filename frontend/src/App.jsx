import { useEffect, useRef, useState } from 'react'
import './Auth.css'
import Dashboard from './Dashboard.jsx'
import PlayerProfile from './PlayerProfile.jsx'
import PlayerSearch from './PlayerSearch.jsx'
import JobsPage from './JobsPage.jsx'
import TryoutsPage from './TryoutsPage.jsx'
import ballImage from '../../public/img/fifa-world-cup-ball.avif'
import footballImage from '../../public/img/football-stadium.jpg'
import footballStandImage from '../../public/img/football-stadium1.jpg'
import logoMark from '../../public/img/logo-mark.svg'
import worldCupBallImage from '../../public/img/world-cup-ball.avif'
import { supabase } from './lib/supabase'
import { BASKETBALL_ENABLED, containsContactInfo } from './lib/features'

// ─── constants ────────────────────────────────────────────────────────────────
const ROLES = [
  { value: 'player',  label: 'Player',          icon: 'bi-person-arms-up'   },
  { value: 'academy', label: 'Academy / Club',   icon: 'bi-building'         },
  { value: 'agent',   label: 'Agent / Scout',    icon: 'bi-binoculars'       },
  { value: 'coach',   label: 'Coach / Manager',  icon: 'bi-clipboard2-pulse' },
]

const SPORTS = BASKETBALL_ENABLED
  ? [
      { value: 'football',   label: 'Football',   icon: 'bi-dribbble' },
      { value: 'basketball', label: 'Basketball', icon: 'bi-circle'   },
    ]
  : [
      { value: 'football', label: 'Football', icon: 'bi-dribbble' },
    ]

const roleCards = [
  {
    accountRole: 'player',
    cardIcon: 'bi-person-arms-up',
    heroIcon: 'bi-person-arms-up',
    title: 'For Players',
    heroTitle: 'Players',
    heroCopy: 'Free profile. Get discovered.',
    copy: 'Create a free profile with photos, full-match videos and your CV. Go public and get discovered by verified clubs, academies and agents — no middleman required.',
    action: 'Create your player profile',
  },
  {
    accountRole: 'academy',
    cardIcon: 'bi-person-badge',
    heroIcon: 'bi-building',
    title: 'For Clubs & Academies',
    heroTitle: 'Clubs ✓ Verified',
    heroCopy: 'Showcase your squad to the world.',
    copy: 'Create players, build your squad roster, post Player Needed & Staff Needed jobs, and showcase your verified club to scouts and agents worldwide.',
    action: 'Register your club / academy',
  },
  {
    accountRole: 'agent',
    cardIcon: 'bi-search',
    heroIcon: 'bi-binoculars',
    title: 'For Agents & Scouts',
    heroTitle: 'Agents',
    heroCopy: 'Scout the next generation.',
    copy: 'Search verified players by position, age and region. Build a watchlist, post Player Positions Needed on behalf of clubs, and run verified tryout opportunities.',
    action: 'Register as an agent / scout',
  },
  {
    accountRole: 'coach',
    cardIcon: 'bi-briefcase',
    heroIcon: 'bi-clipboard2-pulse',
    title: 'For Coaches & Sporting Directors',
    heroTitle: 'Coaches',
    heroCopy: 'Land your next role.',
    copy: 'Browse coaching and management roles, apply with your verified profile, and recommend talented players directly to agents and clubs from your dashboard.',
    action: 'Register as a coach / manager',
  },
]

const worldClocks = [
  ['London',   'Europe/London'   ],
  ['New York', 'America/New_York'],
  ['Tokyo',    'Asia/Tokyo'      ],
  ['Lagos',    'Africa/Lagos'    ],
  ['Qatar',    'Asia/Qatar'      ],
]

// ─── password strength ────────────────────────────────────────────────────────

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

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthClass = ['', 'weak', 'fair', 'good', 'strong']

// ─── AuthModal ────────────────────────────────────────────────────────────────

function AuthModal({ onClose, initialMode, initialRole }) {
  const [mode, setMode]               = useState(initialMode)   // 'signin' | 'signup' | 'forgot' | 'confirmed' | 'reset-sent'
  const [role, setRole]               = useState(initialRole)
  const [sport, setSport]             = useState('football')
  const [message, setMessage]         = useState('')
  const [msgType, setMsgType]         = useState('error')       // 'error' | 'info'
  const [busy, setBusy]               = useState(false)
  const [showPw, setShowPw]           = useState(false)
  const [pwValue, setPwValue]         = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const backdropRef                   = useRef(null)
  const firstInputRef                 = useRef(null)

  const strength = passwordStrength(pwValue)

  // trap focus on open
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [mode])

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const showMsg = (text, type = 'error') => {
    setMessage(text)
    setMsgType(type)
  }

  const clearMsg = () => setMessage('')

  const switchMode = (next) => {
    clearMsg()
    setPwValue('')
    setShowPw(false)
    setMode(next)
  }

  // ── sign in ──────────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!supabase) {
      showMsg('Connection error. Please try refreshing the page.', 'info')
      return
    }
    setBusy(true)
    clearMsg()
    const fd    = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const pw    = String(fd.get('password') ?? '')

    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setBusy(false)

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        showMsg('Your email is not confirmed yet. Check your inbox for the confirmation link — also check your spam folder.', 'info')
      } else if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('invalid login')) {
        showMsg('Incorrect email or password. Please check your details and try again.')
      } else if (error.message.toLowerCase().includes('user not found')) {
        showMsg('No account found with this email. Create a free account below.', 'info')
      } else {
        showMsg(error.message)
      }
      return
    }

    // Success — onAuthStateChange fires SIGNED_IN and closes modal automatically
    // The parent App's onAuthStateChange handler calls setAuthOpen(false)
  }

  // ── sign up ──────────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    clearMsg()
    const fd       = new FormData(e.currentTarget)
    const fullName = String(fd.get('full_name') ?? '').trim()
    const email    = String(fd.get('email') ?? '').trim()
    const pw       = String(fd.get('password') ?? '')

    if (pw.length < 8) {
      setBusy(false)
      showMsg('Password must be at least 8 characters.')
      return
    }

    if (containsContactInfo(fullName)) {
      setBusy(false)
      showMsg('Please don\'t include phone numbers or email addresses in your name.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        data: {
          full_name: fullName,
          role,
          sport,
        },
      },
    })
    setBusy(false)

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        showMsg('An account with this email already exists. Try signing in instead.')
      } else {
        showMsg(error.message)
      }
      return
    }

    if (!data.session) {
      // Email confirmation required — show the check inbox screen
      setConfirmedEmail(email)
      setMode('confirmed')
    }
    // session exists → auto-confirmed, onAuthStateChange fires SIGNED_IN → dashboard
  }

  // ── forgot password ───────────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    clearMsg()
    const fd    = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?reset=1`,
    })
    setBusy(false)

    if (error) {
      showMsg(error.message)
    } else {
      setMode('reset-sent')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const panelContent = () => {

    // ── email confirmed screen ───────────────────────────────────────────────
    if (mode === 'confirmed') {
      return (
        <div className="auth-confirm">
          <div className="auth-confirm-icon">
            <i className="bi bi-envelope-check" aria-hidden="true" />
          </div>
          <h3>Check your inbox</h3>
          <p>
            We sent a confirmation link to <strong>{confirmedEmail}</strong>.
            Click the link in that email to activate your account, then come back here to sign in.
          </p>
          <p style={{ fontSize: 12, marginBottom: 0, color: 'var(--fc-muted)' }}>
            Can't find it? Check your spam folder.
          </p>
          <button
            className="auth-submit mt-3"
            type="button"
            onClick={() => switchMode('signin')}
          >
            Back to sign in
          </button>
        </div>
      )
    }

    // ── password reset sent ──────────────────────────────────────────────────
    if (mode === 'reset-sent') {
      return (
        <div className="auth-confirm">
          <div className="auth-confirm-icon">
            <i className="bi bi-lock" aria-hidden="true" />
          </div>
          <h3>Reset link sent</h3>
          <p>
            Check your inbox for a password reset link. It expires in 1 hour.
          </p>
          <button
            className="auth-submit mt-3"
            type="button"
            onClick={() => switchMode('signin')}
          >
            Back to sign in
          </button>
        </div>
      )
    }

    // ── forgot password form ─────────────────────────────────────────────────
    if (mode === 'forgot') {
      return (
        <>
          <p className="eyebrow">Account recovery</p>
          <h2 id="auth-heading">Reset your password</h2>
          <form className="auth-form" onSubmit={handleForgot} noValidate>
            <label className="auth-label">
              <span>Email address</span>
              <input
                ref={firstInputRef}
                className="auth-input"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
            {message && (
              <p className={`auth-message ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
                {message}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : 'Send reset link'}
            </button>
          </form>
          <p className="auth-switch">
            Remembered it?{' '}
            <button type="button" onClick={() => switchMode('signin')}>Sign in</button>
          </p>
        </>
      )
    }

    // ── sign in form ─────────────────────────────────────────────────────────
    if (mode === 'signin') {
      return (
        <>
          <p className="eyebrow">Welcome back</p>
          <h2 id="auth-heading">Sign in to SportBridge</h2>
          <form className="auth-form" onSubmit={handleSignIn} noValidate>
            <label className="auth-label">
              <span>Email address</span>
              <input
                ref={firstInputRef}
                className="auth-input"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <div>
              <label className="auth-label">
                <span>Password</span>
                <div className="auth-password-wrap">
                  <input
                    className="auth-input"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="Your password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw(!showPw)}
                  >
                    <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </label>
              <div className="auth-forgot">
                <button type="button" onClick={() => switchMode('forgot')}>
                  Forgot password?
                </button>
              </div>
            </div>

            {message && (
              <p className={`auth-message ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                : <><i className="bi bi-box-arrow-in-right me-2" aria-hidden="true" />Sign in</>}
            </button>
          </form>

          <p className="auth-switch">
            New to SportBridge?{' '}
            <button type="button" onClick={() => switchMode('signup')}>Create an account</button>
          </p>
        </>
      )
    }

    // ── sign up form ─────────────────────────────────────────────────────────
    return (
      <>
        <p className="eyebrow">Join the network</p>
        <h2 id="auth-heading">Create your account</h2>
        <form className="auth-form" onSubmit={handleSignUp} noValidate>

          {/* Full name */}
          <label className="auth-label">
            <span>Full name</span>
            <input
              ref={firstInputRef}
              className="auth-input"
              type="text"
              name="full_name"
              autoComplete="name"
              required
              placeholder="Your full name"
            />
          </label>

          {/* Role picker */}
          <div>
            <p className="auth-label mb-2" style={{ marginBottom: 8 }}>
              <span>I am a…</span>
            </p>
            <div className="auth-role-grid">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`auth-role-btn${role === r.value ? ' selected' : ''}`}
                  onClick={() => setRole(r.value)}
                  aria-pressed={role === r.value}
                >
                  <i className={`bi ${r.icon}`} aria-hidden="true" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sport picker — basketball hidden until flag is enabled */}
          <div>
            <p className="auth-label" style={{ marginBottom: 8 }}>
              <span>Primary sport</span>
            </p>
            {BASKETBALL_ENABLED ? (
              <div className="auth-sport-pills">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`auth-sport-pill${sport === s.value ? ' selected' : ''}`}
                    onClick={() => setSport(s.value)}
                    aria-pressed={sport === s.value}
                  >
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="auth-sport-pills">
                <button type="button" className="auth-sport-pill selected" disabled>
                  <i className="bi bi-dribbble" aria-hidden="true" /> Football
                </button>
                <button type="button" className="auth-sport-pill" disabled style={{ opacity: .45, cursor: 'not-allowed' }} title="Basketball coming soon">
                  <i className="bi bi-circle" aria-hidden="true" /> Basketball <span style={{ fontSize: 10 }}>(Coming Soon)</span>
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <label className="auth-label">
            <span>Email address</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          {/* Password + strength */}
          <div>
            <label className="auth-label">
              <span>Password <span style={{ fontWeight: 400, color: 'var(--fc-muted)' }}>(min. 8 characters)</span></span>
              <div className="auth-password-wrap">
                <input
                  className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Choose a strong password"
                  value={pwValue}
                  onChange={(e) => setPwValue(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw(!showPw)}
                >
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                </button>
              </div>
            </label>
            {pwValue.length > 0 && (
              <div>
                <div className="auth-strength" aria-label={`Password strength: ${strengthLabel[strength]}`}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`auth-strength-bar${strength >= i ? ` ${strengthClass[strength]}` : ''}`}
                    />
                  ))}
                </div>
                {strength > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--fc-muted)' }}>
                    {strengthLabel[strength]}
                  </span>
                )}
              </div>
            )}
          </div>

          {message && (
            <p className={`auth-message ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
              {message}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</>
              : <><i className="bi bi-person-plus me-2" aria-hidden="true" />Create account</>}
          </button>

          <p style={{ fontSize: 11, color: 'var(--fc-muted)', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
            By creating an account you agree to our terms. SportBridge is free for players.
          </p>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={() => switchMode('signin')}>Sign in</button>
        </p>
      </>
    )
  }

  return (
    <div
      className="sb-auth-backdrop"
      ref={backdropRef}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose() }}
      role="presentation"
    >
      <section
        aria-labelledby="auth-heading"
        aria-modal="true"
        className="auth-panel"
        role="dialog"
      >
        {mode !== 'confirmed' && mode !== 'reset-sent' && (
          <button
            aria-label="Close sign in panel"
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            <i className="bi bi-x" aria-hidden="true" />
          </button>
        )}
        {panelContent()}
      </section>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [view,            setView]            = useState('home')
  const [selectedPlayerId,setSelectedPlayerId]= useState(null)
  const [user,            setUser]            = useState(null)
  const [authOpen,        setAuthOpen]        = useState(false)
  const [authInitMode,    setAuthInitMode]    = useState('signin')
  const [authInitRole,    setAuthInitRole]    = useState('player')
  const [menuOpen,        setMenuOpen]        = useState(false)
  const [darkTheme,       setDarkTheme]       = useState(false)
  const [sport,           setSport]           = useState('football')
  const [sportMenuOpen,   setSportMenuOpen]   = useState(false)
  const [language,        setLanguage]        = useState('en')
  const [languageMenuOpen,setLanguageMenuOpen]= useState(false)
  const [clockNow,        setClockNow]        = useState(() => new Date())

  const openSignup = (role = 'player') => {
    setAuthInitRole(role)
    setAuthInitMode('signup')
    setAuthOpen(true)
  }

  const openSignin = () => {
    setAuthInitMode('signin')
    setAuthOpen(false) // force re-mount if already open
    requestAnimationFrame(() => setAuthOpen(true))
  }

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  // World clock tick
  useEffect(() => {
    const t = window.setInterval(() => setClockNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  // Auth state — restore session on mount and subscribe to future changes.
  // eslint-disable-next-line react/set-state-in-effect -- getSession is async external I/O; setState here is correct.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) setView('dashboard')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (event === 'SIGNED_IN')  { setView('dashboard'); setAuthOpen(false) }
      if (event === 'SIGNED_OUT') { setView('home') }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div data-bs-theme={darkTheme ? 'dark' : 'light'}>
      {/* Skip link */}
      <a className="visually-hidden-focusable btn btn-primary position-absolute top-0 start-0 m-2" href="#main-content">
        Skip to main content
      </a>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="navbar navbar-expand-lg sticky-top shadow-sm" data-bs-theme="dark" id="home">
        <div className="container">
          <a className="navbar-brand" href="#home" aria-label="SportBridge home">
            <span className="d-inline-flex align-items-center gap-2">
              <img src={logoMark} alt="" width="24" height="24" />
              <span className="fw-bold" style={{ fontFamily: 'var(--fc-font-heading)' }}>
                Sport<span className="fc-gradient-text">Bridge</span>
              </span>
            </span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNavbar"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#home" onClick={() => { setView('home'); setMenuOpen(false) }}>Home</a>
              </li>
              {user && (
                <li className="nav-item">
                  <button
                    className={`btn btn-link nav-link${view === 'dashboard' ? ' active' : ''}`}
                    type="button"
                    onClick={() => { setView('dashboard'); setMenuOpen(false) }}
                  >
                    Dashboard
                  </button>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link" href="#players" onClick={() => setMenuOpen(false)}>Players</a>
              </li>
              <li className="nav-item">
                <button className={`btn btn-link nav-link${view === 'jobs' ? ' active' : ''}`} type="button"
                  onClick={() => { setView('jobs'); setMenuOpen(false); window.scrollTo(0,0) }}>Jobs</button>
              </li>
              <li className="nav-item">
                <button className={`btn btn-link nav-link${view === 'tryouts' ? ' active' : ''}`} type="button"
                  onClick={() => { setView('tryouts'); setMenuOpen(false); window.scrollTo(0,0) }}>Tryouts</button>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#roles" onClick={() => setMenuOpen(false)}>Feed</a>
              </li>            </ul>

            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              {/* Sport switcher / badge */}
              {BASKETBALL_ENABLED ? (
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1"
                    type="button"
                    aria-expanded={sportMenuOpen}
                    aria-label="Switch sport"
                    onClick={() => setSportMenuOpen(!sportMenuOpen)}
                  >
                    <i className={`bi ${sport === 'football' ? 'bi-dribbble' : 'bi-circle'}`} aria-hidden="true" />
                    <span>{sport === 'football' ? 'Football' : 'Basketball'}</span>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end${sportMenuOpen ? ' show' : ''}`}>
                    {['football', 'basketball'].map((s) => (
                      <li key={s}>
                        <button
                          className={`dropdown-item d-flex align-items-center justify-content-between${sport === s ? ' active' : ''}`}
                          type="button"
                          onClick={() => { setSport(s); setSportMenuOpen(false) }}
                        >
                          {s === 'football' ? 'Football' : 'Basketball'}
                          {sport === s && <i className="bi bi-check-lg" aria-hidden="true" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <span
                    className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
                    style={{ background: 'var(--fc-gradient-gold)', color: 'var(--fc-navy-900)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', borderRadius: 'var(--fc-radius-pill)', cursor: 'default' }}
                    title="Basketball coming soon"
                  >
                    <i className="bi bi-dribbble" aria-hidden="true" />
                    FOOTBALL <span style={{ opacity: .65, fontWeight: 400 }}></span>
                  </span>
                </li>
              )}

              {/* Language switcher */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1"
                  type="button"
                  aria-expanded={languageMenuOpen}
                  aria-label="Switch language"
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                >
                  <i className="bi bi-globe2" aria-hidden="true" />
                  <span className="text-uppercase">{language}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end${languageMenuOpen ? ' show' : ''}`}>
                  {[['en','English'],['fr','Français'],['pt','Português'],['ar','العربية'],['es','Español']].map(([code, label]) => (
                    <li key={code}>
                      <button
                        className={`dropdown-item d-flex align-items-center justify-content-between${language === code ? ' active' : ''}`}
                        type="button"
                        onClick={() => { setLanguage(code); setLanguageMenuOpen(false) }}
                      >
                        {label}
                        {language === code && <i className="bi bi-check-lg" aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Dark mode */}
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-link nav-link"
                  aria-pressed={darkTheme}
                  aria-label="Toggle dark mode"
                  onClick={() => setDarkTheme(!darkTheme)}
                >
                  <i className={`bi ${darkTheme ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
                </button>
              </li>

              {/* Auth */}
              {user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link d-none d-lg-inline" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link"
                      type="button"
                      onClick={() => supabase?.auth.signOut()}
                    >
                      <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" type="button" onClick={openSignin}>
                      Log in
                    </button>
                  </li>
                  {/* Desktop: Create Account Profile + Find Players */}
                  <li className="nav-item d-none d-lg-flex gap-2 align-items-center ms-lg-1">
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => openSignup('player')}
                    >
                      <i className="bi bi-person-plus me-1" aria-hidden="true" />
                      Create Account
                    </button>
                    <button
                      className="btn btn-outline-light btn-sm"
                      type="button"
                      onClick={() => document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <i className="bi bi-search me-1" aria-hidden="true" />
                      Find Players
                    </button>
                  </li>
                  {/* Mobile: single join button */}
                  <li className="nav-item d-lg-none">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => openSignup()}>
                      Join SportBridge
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-grow-1">
        {view === 'dashboard' && user ? (
          <Dashboard supabase={supabase} user={user} onBack={() => setView('home')} />
        ) : view === 'player' && selectedPlayerId ? (
          <PlayerProfile
            playerId={selectedPlayerId}
            supabase={supabase}
            user={user}
            onBack={() => { setSelectedPlayerId(null); setView('home') }}
            onSignup={(role) => openSignup(role)}
          />
        ) : view === 'jobs' ? (
          <JobsPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : view === 'tryouts' ? (
          <TryoutsPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : (
          <>
            {/* spacer */}
            <div className="container py-4" aria-hidden="true" />

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <section className="fc-hero px-3 px-md-5 py-5 mb-0" aria-labelledby="home-heading">
              <img src={worldCupBallImage} alt="" className="fc-hero-ball d-none d-md-block" />
              <div className="container py-4">
                <div className="row align-items-center g-5">
                  <div className="col-12 col-lg-7">

                    {/* Badge */}
                    <span className="fc-hero-badge fc-animate-in">
                      <i className="bi bi-shield-check me-1" aria-hidden="true" />
                      The World&apos;s #1 Verified Football Network
                    </span>

                    {/* Headline */}
                    <h1 id="home-heading" className="display-4 fw-bold mt-3 mb-3 fc-animate-in fc-delay-1">
                      Stop Chasing Fake Agents.{' '}
                      <span className="fc-gradient-text">Get Verified.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="lead fc-animate-in fc-delay-2" style={{ color: 'rgba(247,249,248,.84)', maxWidth: '56ch' }}>
                      SportBridge connects <strong style={{ color: '#fff' }}>Verified Free Players</strong> with{' '}
                      <strong style={{ color: '#fff' }}>Verified Clubs, Academies, Agents &amp; Scouts</strong> in Nigeria and across the world.
                      Full CV + Full-Match Video + Stats + Secure Unlock —{' '}
                      <em>not just highlights.</em>
                    </p>

                    {/* Comparison pills */}
                    <div className="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-2" role="list" aria-label="SportBridge vs other platforms">
                      {[
                        { vs: 'Instagram', vsText: 'Highlights only',  sbText: 'Verified CV + Full Match + Availability', icon: 'bi-camera-video' },
                        { vs: 'LinkedIn',  vsText: 'Corporate jobs',   sbText: 'Football jobs by Position / Age / Region', icon: 'bi-briefcase' },
                        { vs: 'WhatsApp',  vsText: 'Scams & leaks',    sbText: 'NIN Verified + Video Hash + No Leaked Numbers', icon: 'bi-shield-lock' },
                      ].map(({ vs, vsText, sbText, icon }) => (
                        <div
                          key={vs}
                          role="listitem"
                          className="d-flex align-items-start gap-2 rounded-3 px-3 py-2"
                          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', maxWidth: 340, fontSize: 12 }}
                        >
                          <i className={`bi ${icon} mt-1 flex-shrink-0`} style={{ color: 'var(--fc-gold-400)', fontSize: 14 }} aria-hidden="true" />
                          <div>
                            <span style={{ color: 'rgba(247,249,248,.5)' }}>{vs} = {vsText}</span>
                            <br />
                            <span style={{ color: '#fff', fontWeight: 700 }}>SportBridge = {sbText}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div className="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-3">
                      <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup('player')}>
                        <i className="bi bi-person-plus me-2" aria-hidden="true" />
                        Create Player Profile
                      </button>
                      <a href="#players" className="btn btn-outline-light btn-lg">
                        <i className="bi bi-search me-2" aria-hidden="true" />
                        Find Players
                      </a>
                    </div>

                    {/* Stats */}
                    <div className="row g-4 mt-4 fc-animate-in fc-delay-3">
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">500+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Player profiles</div></div>
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">120+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Verified clubs</div></div>
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">40+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Countries reached</div></div>
                    </div>
                  </div>

                  {/* Right: role cards */}
                  <div className="col-12 col-lg-5">
                    <div className="row row-cols-2 row-cols-lg-1 g-3 text-center text-lg-start">
                      {roleCards.map((role) => (
                        <div className="col" key={role.accountRole}>
                          <div
                            className="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start"
                            style={{ border: 'none' }}
                          >
                            <span className={`fc-icon-badge flex-shrink-0${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}>
                              <i className={`bi ${role.heroIcon}`} aria-hidden="true" />
                            </span>
                            <div className="d-none d-lg-block">
                              <h2 className="h6 mb-1">{role.heroTitle}</h2>
                              <p className="small text-muted mb-0">{role.heroCopy}</p>
                            </div>
                            <h2 className="h6 mb-0 d-lg-none">{role.heroTitle}</h2>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Problem / Solution bar (answers "why not WhatsApp/Instagram") ── */}
            <div className="mb-5" style={{ background: 'var(--fc-navy-900)', borderBottom: '1px solid rgba(245,179,1,.15)' }}>
              <div className="container">
                <div className="row g-0">
                  {[
                    {
                      problem: 'Fake agents collecting fees',
                      solution: 'Verified Agent badge + fee warning on every post',
                      problemIcon: 'bi-person-x',
                      solutionIcon: 'bi-patch-check-fill',
                    },
                    {
                      problem: 'Edited highlight clips',
                      solution: 'Full-match video required + SHA-256 duplicate detector',
                      problemIcon: 'bi-camera-video-off',
                      solutionIcon: 'bi-film',
                    },
                    {
                      problem: 'Phone numbers scraped from WhatsApp',
                      solution: 'Contact unlock only after identity verification',
                      problemIcon: 'bi-telephone-x',
                      solutionIcon: 'bi-lock-fill',
                    },
                  ].map(({ problem, solution, problemIcon, solutionIcon }, i) => (
                    <div key={i} className="col-12 col-md-4" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : undefined }}>
                      <div className="px-4 py-4">
                        {/* Problem */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className={`bi ${problemIcon}`} style={{ color: '#dc3545', fontSize: 15 }} aria-hidden="true" />
                          <span className="small" style={{ color: 'rgba(247,249,248,.45)', textDecoration: 'line-through' }}>{problem}</span>
                        </div>
                        {/* Solution */}
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${solutionIcon}`} style={{ color: 'var(--fc-gold-400)', fontSize: 15 }} aria-hidden="true" />
                          <span className="small fw-semibold" style={{ color: '#fff' }}>{solution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="container">
              {/* ── Role cards ────────────────────────────────────────── */}
              <div className="text-center mb-5" id="roles">
                <h2 className="h3 fw-bold" style={{ color: 'var(--fc-blue-700)' }}>One platform, every side of the game</h2>
                <p className="text-muted">Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.</p>
              </div>

              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 pb-5">
                {roleCards.map((role) => (
                  <div className="col" key={role.accountRole}>
                    <div className="card h-100 p-4" style={{ border: 'none' }}>
                      <span className={`fc-icon-badge mb-3${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}>
                        <i className={`bi ${role.cardIcon}`} aria-hidden="true" />
                      </span>
                      <h2 className="h5">{role.title}</h2>
                      <p className="text-muted">{role.copy}</p>
                      <button
                        type="button"
                        className="fw-semibold btn btn-link p-0 justify-content-start"
                        onClick={() => openSignup(role.accountRole)}
                      >
                        {role.action} <i className="bi bi-arrow-right" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Visual showcase ───────────────────────────────────── */}
              <section className="mb-5" aria-labelledby="sportbridge-visuals-title">
                <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
                  <div>
                    <span className="text-uppercase small fw-semibold text-muted">Built for the game</span>
                    <h2 id="sportbridge-visuals-title" className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
                      A connected sporting world
                    </h2>
                  </div>
                  <p className="text-muted mb-0">From the pitch to the next opportunity.</p>
                </div>
                <div className="fc-visual-showcase mb-3">
                  <figure><img src={footballImage}   alt="Football stadium ready for a match"  loading="lazy" /><figcaption>Find your next stage</figcaption></figure>
                  <figure><img src={footballStandImage} alt="Football stadium from the stands"  loading="lazy" /><figcaption>Make your move</figcaption></figure>
                  <figure><img src={ballImage}        alt="FIFA World Cup football"             loading="lazy" /><figcaption>Every level. Every ambition.</figcaption></figure>
                </div>
                {BASKETBALL_ENABLED && (
                  <div className="fc-sport-strip">
                    <img src="/img/basketball.jpg"         alt="Basketball on court"  loading="lazy" />
                    <img src="/img/basketball-court.jpg"   alt="Basketball court"     loading="lazy" />
                    <img src="/img/basketball-journal.jpg" alt="Basketball journal"   loading="lazy" />
                  </div>
                )}
              </section>

              {/* ── CTA band ──────────────────────────────────────────── */}
              <div className="rounded-4 p-5 mb-5 text-center fc-band-photo">
                <h2 className="h3 fw-bold text-white mb-2">Ready to make your next move?</h2>
                <p className="mb-4" style={{ color: 'rgba(255,255,255,.85)' }}>
                  Join SportBridge today — free for players. Takes one minute.
                </p>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup()}>
                  Create your free account
                </button>
              </div>
            </div>

            {/* ── Directory — powered by PlayerSearch ──────────────────────── */}
            <section className="container py-5" id="players" aria-labelledby="directory-heading">
              <div className="mb-4">
                <span className="text-uppercase small fw-semibold text-muted">Scout the next generation</span>
                <h2 className="h3 fw-bold mb-1" id="directory-heading" style={{ color: 'var(--fc-blue-700)' }}>
                  Player Directory
                </h2>
                <p className="text-muted mb-0">
                  Search verified free players by position, age group, region and foot — find your next signing in seconds.
                </p>
              </div>
              <PlayerSearch
                supabase={supabase}
                onPlayerClick={(id) => { setSelectedPlayerId(id); setView('player'); window.scrollTo(0, 0) }}
              />
            </section>
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="mt-auto py-5"
        style={{ background: 'linear-gradient(160deg, var(--fc-navy-800) 0%, var(--fc-blue-900) 100%)', color: 'rgba(247,249,248,.82)' }}
        data-bs-theme="dark"
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <a className="navbar-brand d-inline-flex align-items-center gap-2 mb-2" href="#home">
                <img src={logoMark} alt="" width="22" height="22" />
                <span className="fw-bold">Sport<span className="fc-gradient-text">Bridge</span></span>
              </a>
              <p className="small mb-0">
                Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.
              </p>
            </div>
            <div className="col-6 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">Explore</h2>
              <ul className="list-unstyled small">
                <li><a className="link-light link-underline-opacity-0" href="#players">Players</a></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('jobs'); window.scrollTo(0,0) }}>Jobs</button></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('tryouts'); window.scrollTo(0,0) }}>Tryouts</button></li>
                <li><a className="link-light link-underline-opacity-0" href="#roles">Feed</a></li>
              </ul>
            </div>
            <div className="col-6 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">Join</h2>
              <ul className="list-unstyled small">
                {roleCards.map((role) => (
                  <li key={role.accountRole}>
                    <button
                      className="btn btn-link link-light link-underline-opacity-0 p-0"
                      type="button"
                      onClick={() => openSignup(role.accountRole)}
                    >
                      {role.accountRole === 'academy' ? 'Academy / Club' : role.accountRole === 'agent' ? 'Agent / Scout' : role.accountRole === 'coach' ? 'Coach / Manager' : 'Player'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">World Clock</h2>
              <div className="d-flex flex-column gap-1 small">
                {worldClocks.map(([city, zone]) => (
                  <div className="d-flex justify-content-between gap-2" key={zone}>
                    <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{city}</span>
                    <span className="fw-semibold font-monospace">
                      {new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(clockNow)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="border-light opacity-25" />
          <p className="small mb-2 fw-bold" style={{ maxWidth: '70ch' }}>
            SportBridge connects players, academies, agents, scouts and coaches, but is not a party to any agreement between them and does not process payments between users. Credentials shown on profiles are self-reported unless marked with a Verified badge. Always independently verify who you are dealing with, and never send money to arrange a trial or introduction.
          </p>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <p className="small mb-0 text-white-50">&copy; {new Date().getFullYear()} SportBridge. All rights reserved.</p>
            <a href="#home" className="small link-light link-underline-opacity-0">
              Back to top <i className="bi bi-arrow-up-short" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

      {/* ── Auth modal ─────────────────────────────────────────────────────── */}
      {authOpen && (
        <AuthModal
          key={`${authInitMode}-${authInitRole}`}
          initialMode={authInitMode}
          initialRole={authInitRole}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </div>
  )
}

export default App
